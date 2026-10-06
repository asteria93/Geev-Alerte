import type { DetectionHistoryItem, NotificationResult, NotificationSettings } from "@/lib/types";

type NotificationAdapter = {
  channel: NotificationResult["channel"];
  send: (item: DetectionHistoryItem, settings: NotificationSettings) => Promise<NotificationResult | null>;
};

const mockAdapter: NotificationAdapter = {
  channel: "mock",
  async send(item, settings) {
    if (!settings.mockEnabled) return null;

    console.info("[mock-notification]", {
      alertId: item.alertId,
      listingId: item.listing.id,
      title: item.listing.title,
    });

    return {
      channel: "mock",
      success: true,
      message: "Notification mock envoyée (aucun service externe contacté)",
    };
  },
};

const discordAdapter: NotificationAdapter = {
  channel: "discord",
  async send(item, settings) {
    if (!settings.discordEnabled) return null;

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      return {
        channel: "discord",
        success: false,
        message: "Discord activé mais DISCORD_WEBHOOK_URL absent",
      };
    }

    const payload = {
      content: [
        "🆕 Nouvelle annonce Geev (source mock)",
        `• ${item.listing.title}`,
        `• Catégorie: ${item.listing.category}`,
        `• Lieu: ${item.listing.locationLabel}`,
        `• Lien: ${item.listing.url}`,
      ].join("\n"),
    };

    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        channel: "discord",
        success: false,
        message: `Discord a renvoyé HTTP ${response.status}`,
      };
    }

    return {
      channel: "discord",
      success: true,
      message: "Notification Discord envoyée",
    };
  },
};

const adapters: NotificationAdapter[] = [mockAdapter, discordAdapter];

export async function sendNotifications(
  item: DetectionHistoryItem,
  settings: NotificationSettings,
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  for (const adapter of adapters) {
    const result = await adapter.send(item, settings);
    if (result) results.push(result);
  }

  return results;
}
