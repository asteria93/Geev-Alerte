import { describe, expect, it } from "vitest";

import { getUnseenMatchingListings } from "@/lib/detection";
import type { Alert, Listing } from "@/lib/types";

const alert: Alert = {
  id: "alert-1",
  name: "Alert jeux",
  category: "jeux-video",
  keywords: ["ps4"],
  keywordMode: "ANY",
  locationId: "paris-75010",
  locationLabel: "Paris",
  latitude: 48.8769,
  longitude: 2.3591,
  radiusKm: 20,
  enabled: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const listings: Listing[] = [
  {
    id: "a",
    title: "PS4 complète",
    description: "1 manette",
    category: "jeux-video",
    locationLabel: "Paris",
    latitude: 48.8769,
    longitude: 2.3591,
    url: "https://example.invalid/a",
    publishedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "b",
    title: "Chaise",
    description: "bois",
    category: "meubles",
    locationLabel: "Paris",
    latitude: 48.8769,
    longitude: 2.3591,
    url: "https://example.invalid/b",
    publishedAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("getUnseenMatchingListings", () => {
  it("keeps only unseen listings", () => {
    const unseen = getUnseenMatchingListings(alert, listings, new Set(["a"]));
    expect(unseen).toEqual([]);
  });

  it("returns new matching listings for dedup flow", () => {
    const unseen = getUnseenMatchingListings(alert, listings, new Set());
    expect(unseen.map((item) => item.id)).toEqual(["a"]);
  });
});
