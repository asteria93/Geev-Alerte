import { describe, expect, it } from "vitest";

import { listingMatchesAlert } from "@/lib/filter";
import type { Alert, Listing } from "@/lib/types";

const baseAlert: Alert = {
  id: "alert-1",
  name: "Test alert",
  category: "jeux-video",
  keywords: ["ps4", "manette"],
  keywordMode: "ANY",
  locationId: "paris-75010",
  locationLabel: "Paris",
  latitude: 48.8769,
  longitude: 2.3591,
  radiusKm: 10,
  enabled: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const baseListing: Listing = {
  id: "listing-1",
  title: "PS4 slim",
  description: "Avec une manette noire",
  category: "jeux-video",
  locationLabel: "Paris",
  latitude: 48.8769,
  longitude: 2.3591,
  url: "https://example.invalid/listing-1",
  publishedAt: "2026-01-01T00:00:00.000Z",
};

describe("listingMatchesAlert", () => {
  it("matches when ANY keyword strategy is satisfied", () => {
    expect(listingMatchesAlert(baseAlert, baseListing)).toBe(true);
  });

  it("requires all keywords in ALL mode", () => {
    const alertAll: Alert = { ...baseAlert, keywordMode: "ALL", keywords: ["ps4", "manette", "blanche"] };
    expect(listingMatchesAlert(alertAll, baseListing)).toBe(false);
  });

  it("rejects listings outside radius", () => {
    const farListing: Listing = { ...baseListing, latitude: 45.7597, longitude: 4.8567 };
    expect(listingMatchesAlert(baseAlert, farListing)).toBe(false);
  });
});
