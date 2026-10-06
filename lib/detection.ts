import { listingMatchesAlert } from "@/lib/filter";
import { sendNotifications } from "@/lib/notifications";
import {
  addHistory,
  getNotificationSettings,
  getSeenByAlert,
  getStore,
  markSeen,
  setLastCheckNow,
} from "@/lib/storage";
import { getListingSource } from "@/lib/sources";
import type { Alert, DetectionHistoryItem, Listing } from "@/lib/types";

export type DetectionRunSummary = {
  source: string;
  checkedAlerts: number;
  matchedListings: number;
  newListings: number;
  historyItems: DetectionHistoryItem[];
};

export function getUnseenMatchingListings(
  alert: Alert,
  listings: Listing[],
  seen: Set<string>,
) {
  const matching = listings.filter((listing) => listingMatchesAlert(alert, listing));
  return matching.filter((listing) => !seen.has(listing.id));
}

export async function runDetectionCycle(): Promise<DetectionRunSummary> {
  const source = getListingSource();
  const listings = await source.getRecentListings();
  const store = await getStore();
  const settings = await getNotificationSettings();
  const historyItems: DetectionHistoryItem[] = [];

  const enabledAlerts = store.alerts.filter((alert) => alert.enabled);

  for (const alert of enabledAlerts) {
    const seen = await getSeenByAlert(alert.id);
    const unseen = getUnseenMatchingListings(alert, listings, seen);

    if (unseen.length === 0) continue;

    for (const listing of unseen) {
      const baseItem: DetectionHistoryItem = {
        id: crypto.randomUUID(),
        alertId: alert.id,
        alertName: alert.name,
        listing,
        detectedAt: new Date().toISOString(),
        notificationResults: [],
      };

      const notificationResults = await sendNotifications(baseItem, settings);
      const fullItem: DetectionHistoryItem = {
        ...baseItem,
        notificationResults,
      };

      historyItems.push(fullItem);
    }

    await markSeen(
      alert.id,
      unseen.map((listing) => listing.id),
    );
  }

  if (historyItems.length > 0) {
    await addHistory(historyItems);
  } else {
    await setLastCheckNow();
  }

  return {
    source: source.name,
    checkedAlerts: enabledAlerts.length,
    matchedListings: listings.length,
    newListings: historyItems.length,
    historyItems,
  };
}
