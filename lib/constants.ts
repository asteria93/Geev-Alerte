import type { LocationPreset } from "@/lib/types";

export const LOCATION_PRESETS: LocationPreset[] = [
  { id: "paris-75010", label: "Paris 75010", latitude: 48.8769, longitude: 2.3591 },
  { id: "lyon-69003", label: "Lyon 69003", latitude: 45.7597, longitude: 4.8567 },
  { id: "marseille-13001", label: "Marseille 13001", latitude: 43.2981, longitude: 5.3819 },
  { id: "lille-59000", label: "Lille 59000", latitude: 50.6292, longitude: 3.0573 },
  { id: "toulouse-31000", label: "Toulouse 31000", latitude: 43.6043, longitude: 1.4437 },
];

export const RADIUS_OPTIONS_KM = [1, 5, 10, 20, 50];
