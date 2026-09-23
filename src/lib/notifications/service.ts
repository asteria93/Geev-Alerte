import { prisma } from "@/lib/db";
import { defaultChannels } from "@/lib/notifications/channels";
import type { NotificationPayload, NotificationResult } from "@/lib/notifications/types";

export async function getOrCreateNotificationSettings() {
  const existing = await prisma.notificationSettings.findUnique({ where: { id: 1 } });
  if (existing) {
    return existing;
  }

  return prisma.notificationSettings.create({
    data: {
      id: 1,
      discordEnabled: false,
      webPushEnabled: false,
      telegramEnabled: false,
      emailEnabled: false,
    },
  });
}

export async function sendNotifications(payload: NotificationPayload) {
  const settings = await getOrCreateNotificationSettings();
  const results: NotificationResult[] = [];

  for (const channel of defaultChannels) {
    results.push(await channel.send(settings, payload));
  }

  return results;
}
