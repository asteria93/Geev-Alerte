import { describe, expect, it, vi } from "vitest";
import type { NotificationSettings } from "@prisma/client";
import { discordNotificationChannel } from "@/lib/notifications/channels";

const settings: NotificationSettings = {
  id: 1,
  discordWebhookUrl: "https://discord.example/webhook",
  webPushEnabled: false,
  discordEnabled: true,
  telegramEnabled: false,
  emailEnabled: false,
  updatedAt: new Date(),
};

describe("discordNotificationChannel", () => {
  it("sends discord payload", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await discordNotificationChannel.send(settings, {
      title: "PS4",
      category: "jeux_video",
      location: "Drancy",
      detectedAt: new Date(),
      listingUrl: "https://example.com/item",
    });

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
