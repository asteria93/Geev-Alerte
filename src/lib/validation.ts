import { z } from "zod";
import { CATEGORIES, FREQUENCY_OPTIONS, RADIUS_OPTIONS } from "@/lib/constants";

const urlSchema = z
  .url()
  .refine((value) => value.startsWith("https://") || value.startsWith("http://"), {
    message: "URL invalide",
  });

export const alertFormSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    categories: z.array(z.enum(CATEGORIES)).min(1),
    keywords: z.array(z.string().trim().max(50)).max(10).default([]),
    keywordMode: z.enum(["ANY", "ALL"]),
    locationType: z.enum(["CITY", "POSTAL_CODE", "COORDINATES"]),
    locationValue: z.string().trim().min(1).max(100),
    radiusKm: z.number().int().refine((value) => RADIUS_OPTIONS.includes(value as (typeof RADIUS_OPTIONS)[number])),
    frequencyMinutes: z
      .number()
      .int()
      .refine((value) => FREQUENCY_OPTIONS.includes(value as (typeof FREQUENCY_OPTIONS)[number])),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.locationType === "COORDINATES") {
      const [lat, lng] = value.locationValue.split(",").map((item) => Number(item.trim()));
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        ctx.addIssue({
          path: ["locationValue"],
          code: z.ZodIssueCode.custom,
          message: "Les coordonnées doivent être au format latitude,longitude",
        });
      }
    }
  });

export const notificationSettingsSchema = z.object({
  discordEnabled: z.boolean(),
  webPushEnabled: z.boolean(),
  telegramEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  discordWebhookUrl: z.union([urlSchema, z.literal(""), z.undefined()]).optional(),
});

export const mockListingSchema = z.object({
  stableId: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(120),
  category: z.enum(CATEGORIES),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().max(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  imageUrl: z.union([urlSchema, z.literal(""), z.undefined()]).optional(),
  listingUrl: urlSchema,
});

export const pushSubscriptionSchema = z.object({
  endpoint: urlSchema,
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
