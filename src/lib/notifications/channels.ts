import type { NotificationChannel, NotificationPayload, NotificationResult } from "@/lib/notifications/types";
import type { NotificationSettings } from "@prisma/client";

function buildContent(payload: NotificationPayload) {
  return {
    content: [
      "🆕 Nouvelle annonce Geev (mock)",
      `**${payload.title}**`,
      `Catégorie: ${payload.category}`,
      `Lieu: ${payload.location}`,
      `Publié: ${payload.publishedAt?.toISOString() ?? "inconnue"}`,
      `Détecté: ${payload.detectedAt.toISOString()}`,
      payload.listingUrl,
    ].join("\n"),
  };
}

export const discordNotificationChannel: NotificationChannel = {
  name: "discord",
  async send(settings, payload) {
    if (!settings.discordEnabled) {
      return { channel: "discord", success: true, message: "Canal Discord désactivé" };
    }

    const webhookUrl = settings.discordWebhookUrl || process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return { channel: "discord", success: false, message: "Webhook Discord non configuré" };
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildContent(payload)),
    });

    if (!response.ok) {
      return {
        channel: "discord",
        success: false,
        message: `Erreur Discord (${response.status})`,
      };
    }

    return { channel: "discord", success: true, message: "Notification Discord envoyée" };
  },
};

async function unsupported(name: string): Promise<NotificationResult> {
  return {
    channel: name,
    success: true,
    message: `Canal ${name} non implémenté (interface prête)`,
  };
}

export const webPushNotificationChannel: NotificationChannel = {
  name: "webpush",
  async send(settings: NotificationSettings) {
    if (!settings.webPushEnabled) {
      return { channel: "webpush", success: true, message: "Web Push désactivé" };
    }
    return unsupported("webpush");
  },
};

export const telegramNotificationChannel: NotificationChannel = {
  name: "telegram",
  async send(settings: NotificationSettings) {
    if (!settings.telegramEnabled) {
      return { channel: "telegram", success: true, message: "Telegram désactivé" };
    }
    return unsupported("telegram");
  },
};

export const emailNotificationChannel: NotificationChannel = {
  name: "email",
  async send(settings: NotificationSettings) {
    if (!settings.emailEnabled) {
      return { channel: "email", success: true, message: "Email désactivé" };
    }
    return unsupported("email");
  },
};

export const defaultChannels: NotificationChannel[] = [
  discordNotificationChannel,
  webPushNotificationChannel,
  telegramNotificationChannel,
  emailNotificationChannel,
];
