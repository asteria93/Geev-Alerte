import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { LOCATION_PRESETS } from "@/lib/constants";
import type {
  Alert,
  CreateOrUpdateAlertInput,
  DemoStore,
  DetectionHistoryItem,
  Listing,
  NotificationSettings,
} from "@/lib/types";

const STORE_PATH = path.join(process.cwd(), "data", "demo-store.json");

const now = () => new Date().toISOString();

function createSeedListings(): Listing[] {
  return [
    {
      id: "listing-1",
      title: "PS4 + manette",
      description: "Console en bon état avec une manette officielle.",
      category: "jeux-video",
      locationLabel: "Paris 75010",
      latitude: LOCATION_PRESETS[0].latitude,
      longitude: LOCATION_PRESETS[0].longitude,
      url: "https://example.invalid/listing-1",
      publishedAt: now(),
    },
    {
      id: "listing-2",
      title: "Canapé 3 places gris",
      description: "Canapé confortable, à venir récupérer rapidement.",
      category: "meubles",
      locationLabel: "Lyon 69003",
      latitude: LOCATION_PRESETS[1].latitude,
      longitude: LOCATION_PRESETS[1].longitude,
      url: "https://example.invalid/listing-2",
      publishedAt: now(),
    },
    {
      id: "listing-3",
      title: "Livres Pokémon lot de 5",
      description: "Livres jeunesse Pokémon en très bon état.",
      category: "livres",
      locationLabel: "Lille 59000",
      latitude: LOCATION_PRESETS[3].latitude,
      longitude: LOCATION_PRESETS[3].longitude,
      url: "https://example.invalid/listing-3",
      publishedAt: now(),
    },
  ];
}

function defaultStore(): DemoStore {
  return {
    alerts: [],
    history: [],
    seenByAlert: {},
    mockListings: createSeedListings(),
    notificationSettings: {
      mockEnabled: true,
      discordEnabled: false,
    },
    lastCheckAt: null,
  };
}

async function saveStore(store: DemoStore) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function getStore(): Promise<DemoStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as DemoStore;
  } catch {
    const store = defaultStore();
    await saveStore(store);
    return store;
  }
}

export async function updateStore(mutator: (store: DemoStore) => DemoStore | Promise<DemoStore>) {
  const current = await getStore();
  const next = await mutator(current);
  await saveStore(next);
  return next;
}

export async function createAlert(input: CreateOrUpdateAlertInput): Promise<Alert> {
  const alert: Alert = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now(),
    updatedAt: now(),
  };

  await updateStore((store) => ({ ...store, alerts: [alert, ...store.alerts] }));
  return alert;
}

export async function listAlerts() {
  const store = await getStore();
  return store.alerts;
}

export async function getAlertById(id: string) {
  const store = await getStore();
  return store.alerts.find((alert) => alert.id === id) ?? null;
}

export async function updateAlert(id: string, input: CreateOrUpdateAlertInput) {
  const store = await updateStore((draft) => ({
    ...draft,
    alerts: draft.alerts.map((alert) =>
      alert.id === id
        ? {
            ...alert,
            ...input,
            updatedAt: now(),
          }
        : alert,
    ),
  }));

  return store.alerts.find((alert) => alert.id === id) ?? null;
}

export async function setAlertEnabled(id: string, enabled: boolean) {
  const store = await updateStore((draft) => ({
    ...draft,
    alerts: draft.alerts.map((alert) =>
      alert.id === id ? { ...alert, enabled, updatedAt: now() } : alert,
    ),
  }));

  return store.alerts.find((alert) => alert.id === id) ?? null;
}

export async function addHistory(items: DetectionHistoryItem[]) {
  await updateStore((store) => ({
    ...store,
    history: [...items, ...store.history].slice(0, 200),
  }));
}

export async function listHistory() {
  const store = await getStore();
  return store.history;
}

export async function getNotificationSettings() {
  const store = await getStore();
  return store.notificationSettings;
}

export async function updateNotificationSettings(settings: NotificationSettings) {
  const store = await updateStore((draft) => ({ ...draft, notificationSettings: settings }));
  return store.notificationSettings;
}

export async function listMockListings() {
  const store = await getStore();
  return store.mockListings;
}

export async function addMockListing(listing: Omit<Listing, "id" | "publishedAt">) {
  const created: Listing = {
    ...listing,
    id: crypto.randomUUID(),
    publishedAt: now(),
  };

  await updateStore((store) => ({ ...store, mockListings: [created, ...store.mockListings] }));
  return created;
}

export async function markSeen(alertId: string, listingIds: string[]) {
  await updateStore((store) => {
    const previous = new Set(store.seenByAlert[alertId] ?? []);
    for (const id of listingIds) previous.add(id);

    return {
      ...store,
      seenByAlert: {
        ...store.seenByAlert,
        [alertId]: [...previous],
      },
      lastCheckAt: now(),
    };
  });
}

export async function getSeenByAlert(alertId: string) {
  const store = await getStore();
  return new Set(store.seenByAlert[alertId] ?? []);
}

export async function setLastCheckNow() {
  await updateStore((store) => ({ ...store, lastCheckAt: now() }));
}
