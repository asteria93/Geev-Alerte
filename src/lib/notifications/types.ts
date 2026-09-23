import type { NotificationSettings } from "@prisma/client";

export type NotificationPayload = {
  title: string;
  category: string;
  location: string;
  publishedAt?: Date;
  detectedAt: Date;
  listingUrl: string;
  imageUrl?: string | null;
};

export type NotificationResult = {
  channel: string;
  success: boolean;
  message: string;
};

export interface NotificationChannel {
  name: string;
  send(settings: NotificationSettings, payload: NotificationPayload): Promise<NotificationResult>;
}
