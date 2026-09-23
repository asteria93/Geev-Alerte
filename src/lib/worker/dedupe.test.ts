import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { runDetectionCycle } from "@/lib/worker/run-detection-cycle";

vi.mock("@/lib/notifications/service", () => ({
  sendNotifications: vi.fn(async () => [{ channel: "discord", success: true, message: "ok" }]),
}));

describe("runDetectionCycle dedupe and persistence", () => {
  beforeEach(async () => {
    await prisma.detectedListing.deleteMany();
    await prisma.listingSeen.deleteMany();
    await prisma.mockListing.deleteMany();
    await prisma.alert.deleteMany();

    await prisma.alert.create({
      data: {
        name: "Jeux Drancy",
        categories: ["jeux_video"],
        keywords: ["switch"],
        keywordMode: "ANY",
        locationType: "CITY",
        locationValue: "Drancy",
        radiusKm: 5,
        frequencyMinutes: 10,
        isActive: true,
      },
    });

    await prisma.mockListing.create({
      data: {
        stableId: "mock-1",
        title: "Nintendo Switch",
        category: "jeux_video",
        city: "Drancy",
        listingUrl: "https://example.com/switch",
      },
    });
  });

  it("stores listing only once", async () => {
    const first = await runDetectionCycle();
    expect(first.ok).toBe(true);

    const second = await runDetectionCycle();
    expect(second.ok).toBe(true);

    const detections = await prisma.detectedListing.count();
    const seen = await prisma.listingSeen.count();

    expect(detections).toBe(1);
    expect(seen).toBe(1);
  });
});
