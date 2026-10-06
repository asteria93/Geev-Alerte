import { distanceInKm } from "@/lib/geo";
import type { Alert, Listing } from "@/lib/types";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matchKeywords(alert: Alert, listing: Listing) {
  if (alert.keywords.length === 0) return true;

  const haystack = normalize(`${listing.title} ${listing.description}`);

  if (alert.keywordMode === "ALL") {
    return alert.keywords.every((keyword) => haystack.includes(normalize(keyword)));
  }

  return alert.keywords.some((keyword) => haystack.includes(normalize(keyword)));
}

function matchRadius(alert: Alert, listing: Listing) {
  const distance = distanceInKm(alert.latitude, alert.longitude, listing.latitude, listing.longitude);
  return distance <= alert.radiusKm;
}

export function listingMatchesAlert(alert: Alert, listing: Listing) {
  if (!alert.enabled) return false;
  if (listing.category !== alert.category) return false;
  if (!matchKeywords(alert, listing)) return false;
  return matchRadius(alert, listing);
}
