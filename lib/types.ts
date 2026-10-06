export const KEYWORD_MODES = ["ANY", "ALL"] as const;
export type KeywordMode = (typeof KEYWORD_MODES)[number];

export const CATEGORIES = [
  "electronique",
  "jeux-video",
  "vetements",
  "meubles",
  "livres",
  "nourriture",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type LocationPreset = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export type Alert = {
  id: string;
  name: string;
  category: Category;
  keywords: string[];
  keywordMode: KeywordMode;
  locationId: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  category: Category;
  locationLabel: string;
  latitude: number;
  longitude: number;
  url: string;
  imageUrl?: string;
  publishedAt: string;
};

export type NotificationResult = {
  channel: "mock" | "discord";
  success: boolean;
  message: string;
};

export type DetectionHistoryItem = {
  id: string;
  alertId: string;
  alertName: string;
  listing: Listing;
  detectedAt: string;
  notificationResults: NotificationResult[];
};

export type NotificationSettings = {
  mockEnabled: boolean;
  discordEnabled: boolean;
};

export type DemoStore = {
  alerts: Alert[];
  history: DetectionHistoryItem[];
  seenByAlert: Record<string, string[]>;
  mockListings: Listing[];
  notificationSettings: NotificationSettings;
  lastCheckAt: string | null;
};

export type CreateOrUpdateAlertInput = {
  name: string;
  category: Category;
  keywords: string[];
  keywordMode: KeywordMode;
  locationId: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  enabled: boolean;
};
