import { WorkerRunStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendNotifications } from "@/lib/notifications/service";
import { matchesAlert } from "@/lib/alerts/filter";
import { getListingSource } from "@/lib/sources";

const LOCK_NAME = "monitor-lock";
const LOCK_DURATION_MS = 4 * 60 * 1000;

async function acquireLock(owner: string) {
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + LOCK_DURATION_MS);

  const updated = await prisma.executionLock.updateMany({
    where: {
      name: LOCK_NAME,
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
    },
    data: { owner, lockedUntil },
  });

  if (updated.count > 0) {
    return true;
  }

  try {
    await prisma.executionLock.create({
      data: {
        name: LOCK_NAME,
        owner,
        lockedUntil,
      },
    });
    return true;
  } catch {
    return false;
  }
}

async function releaseLock(owner: string) {
  await prisma.executionLock.updateMany({
    where: { name: LOCK_NAME, owner },
    data: { owner: null, lockedUntil: null },
  });
}

function buildLocation(city: string, postalCode?: string | null) {
  return postalCode ? `${city} (${postalCode})` : city;
}

export async function runDetectionCycle() {
  const owner = `run-${Date.now()}`;
  if (!(await acquireLock(owner))) {
    logger.warn({ lock: LOCK_NAME }, "worker already running");
    return { ok: false, message: "Une exécution est déjà en cours" };
  }

  await prisma.workerState.upsert({
    where: { id: 1 },
    update: { status: WorkerRunStatus.RUNNING, lastRunAt: new Date(), lastError: null },
    create: { id: 1, status: WorkerRunStatus.RUNNING, lastRunAt: new Date() },
  });

  try {
    const source = getListingSource();
    const alerts = await prisma.alert.findMany({ where: { isActive: true } });
    const listings = await source.fetchListings({ now: new Date() });

    let detectionsCount = 0;

    for (const listing of listings) {
      const matchingAlerts = alerts.filter((alert) => matchesAlert(alert, listing));
      if (!matchingAlerts.length) {
        continue;
      }

      const existingSeen = await prisma.listingSeen.findUnique({
        where: {
          sourceName_stableId: {
            sourceName: source.name,
            stableId: listing.stableId,
          },
        },
      });

      if (existingSeen) {
        continue;
      }

      await prisma.listingSeen.create({
        data: {
          sourceName: source.name,
          stableId: listing.stableId,
          listingUrl: listing.listingUrl,
        },
      });

      for (const alert of matchingAlerts) {
        const detectedAt = new Date();
        await prisma.detectedListing.create({
          data: {
            alertId: alert.id,
            sourceName: source.name,
            stableId: listing.stableId,
            title: listing.title,
            category: listing.category,
            location: buildLocation(listing.city, listing.postalCode),
            publishedAt: listing.publishedAt,
            imageUrl: listing.imageUrl,
            listingUrl: listing.listingUrl,
            detectedAt,
          },
        });

        await sendNotifications({
          title: listing.title,
          category: listing.category,
          location: buildLocation(listing.city, listing.postalCode),
          publishedAt: listing.publishedAt,
          imageUrl: listing.imageUrl,
          listingUrl: listing.listingUrl,
          detectedAt,
        });

        detectionsCount += 1;
      }
    }

    await prisma.alert.updateMany({ where: { isActive: true }, data: { lastCheckedAt: new Date() } });
    await prisma.workerState.upsert({
      where: { id: 1 },
      update: { status: WorkerRunStatus.SUCCESS, lastSuccessAt: new Date(), lastError: null },
      create: { id: 1, status: WorkerRunStatus.SUCCESS, lastSuccessAt: new Date() },
    });

    logger.info({ detectionsCount }, "worker completed successfully");
    return { ok: true, detectionsCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    logger.error({ err: error }, "worker execution failed");

    await prisma.workerState.upsert({
      where: { id: 1 },
      update: { status: WorkerRunStatus.ERROR, lastError: message },
      create: { id: 1, status: WorkerRunStatus.ERROR, lastError: message },
    });

    return { ok: false, message };
  } finally {
    await releaseLock(owner);
  }
}
