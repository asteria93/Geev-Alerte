import type { Alert, KeywordMode, LocationType } from "@prisma/client";

export type SourceListing = {
  stableId: string;
  title: string;
  category: string;
  city: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  publishedAt?: Date;
  imageUrl?: string | null;
  listingUrl: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matchKeywords(title: string, keywords: string[], mode: KeywordMode) {
  if (!keywords.length) {
    return true;
  }

  const normalizedTitle = normalize(title);
  const checks = keywords.map((keyword) => normalizedTitle.includes(normalize(keyword)));

  return mode === "ALL" ? checks.every(Boolean) : checks.some(Boolean);
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earth = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchLocation(alert: Alert, listing: SourceListing) {
  const value = normalize(alert.locationValue);

  if (alert.locationType === "CITY") {
    return normalize(listing.city) === value;
  }

  if (alert.locationType === "POSTAL_CODE") {
    return normalize(listing.postalCode ?? "") === value;
  }

  if (
    alert.locationType === "COORDINATES" &&
    alert.latitude !== null &&
    alert.longitude !== null &&
    listing.latitude !== null &&
    listing.latitude !== undefined &&
    listing.longitude !== null &&
    listing.longitude !== undefined
  ) {
    return distanceKm(alert.latitude, alert.longitude, listing.latitude, listing.longitude) <= alert.radiusKm;
  }

  return false;
}

export function matchesAlert(alert: Alert, listing: SourceListing) {
  if (!alert.isActive) {
    return false;
  }

  const categories = (alert.categories as string[]).map(normalize);
  const keywords = (alert.keywords as string[]).map((keyword) => keyword.trim()).filter(Boolean);

  if (!categories.includes(normalize(listing.category))) {
    return false;
  }

  if (!matchKeywords(listing.title, keywords, alert.keywordMode)) {
    return false;
  }

  return matchLocation(alert, listing);
}

export function parseCoordinates(input: string): { latitude: number; longitude: number } | null {
  const [lat, lng] = input.split(",").map((item) => Number(item.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { latitude: lat, longitude: lng };
}

export const LOCATION_TYPES: LocationType[] = ["CITY", "POSTAL_CODE", "COORDINATES"];
