import { describe, expect, it } from "vitest";
import type { Alert } from "@prisma/client";
import { matchesAlert } from "@/lib/alerts/filter";

const baseAlert: Alert = {
  id: "a1",
  name: "Alerte PS4",
  categories: ["jeux_video"],
  keywords: ["PS4", "manette"],
  keywordMode: "ANY",
  locationType: "CITY",
  locationValue: "Drancy",
  latitude: null,
  longitude: null,
  radiusKm: 5,
  frequencyMinutes: 10,
  isActive: true,
  lastCheckedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("matchesAlert", () => {
  it("matches in ANY mode when one keyword is found", () => {
    expect(
      matchesAlert(baseAlert, {
        stableId: "s1",
        title: "PS4 avec deux manettes",
        category: "jeux_video",
        city: "Drancy",
        listingUrl: "https://example.com/1",
      }),
    ).toBe(true);
  });

  it("requires all keywords in ALL mode", () => {
    const allMode = { ...baseAlert, keywordMode: "ALL" as const };

    expect(
      matchesAlert(allMode, {
        stableId: "s2",
        title: "PS4 slim",
        category: "jeux_video",
        city: "Drancy",
        listingUrl: "https://example.com/2",
      }),
    ).toBe(false);

    expect(
      matchesAlert(allMode, {
        stableId: "s3",
        title: "PS4 + manette neuve",
        category: "jeux_video",
        city: "Drancy",
        listingUrl: "https://example.com/3",
      }),
    ).toBe(true);
  });

  it("matches coordinates within radius", () => {
    const coordinatesAlert = {
      ...baseAlert,
      locationType: "COORDINATES" as const,
      locationValue: "48.8566,2.3522",
      latitude: 48.8566,
      longitude: 2.3522,
      keywords: [],
    };

    expect(
      matchesAlert(coordinatesAlert, {
        stableId: "s4",
        title: "Don meuble",
        category: "jeux_video",
        city: "Paris",
        latitude: 48.861,
        longitude: 2.35,
        listingUrl: "https://example.com/4",
      }),
    ).toBe(true);
  });
});
