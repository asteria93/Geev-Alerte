import { CATEGORIES, KEYWORD_MODES } from "@/lib/types";
import type { CreateOrUpdateAlertInput } from "@/lib/types";

type InputPayload = Record<string, unknown>;

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function parseAlertInput(payload: InputPayload): CreateOrUpdateAlertInput {
  const name = String(payload.name ?? "").trim();
  const category = String(payload.category ?? "");
  const keywordMode = String(payload.keywordMode ?? "ANY");
  const keywordsRaw = Array.isArray(payload.keywords) ? payload.keywords : [];
  const locationId = String(payload.locationId ?? "").trim();
  const locationLabel = String(payload.locationLabel ?? "").trim();
  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  const radiusKm = Number(payload.radiusKm);
  const enabled = payload.enabled === undefined ? true : Boolean(payload.enabled);

  assert(name.length >= 3, "Le nom de l'alerte doit contenir au moins 3 caractères.");
  assert(CATEGORIES.includes(category as (typeof CATEGORIES)[number]), "Catégorie invalide.");
  assert(
    KEYWORD_MODES.includes(keywordMode as (typeof KEYWORD_MODES)[number]),
    "Mode de mots-clés invalide.",
  );
  assert(locationId.length > 0, "La localisation est obligatoire.");
  assert(locationLabel.length > 0, "Le libellé de localisation est obligatoire.");
  assert(Number.isFinite(latitude), "Latitude invalide.");
  assert(Number.isFinite(longitude), "Longitude invalide.");
  assert(Number.isFinite(radiusKm) && radiusKm > 0, "Rayon invalide.");

  const keywords = keywordsRaw
    .map((value) => String(value).trim())
    .filter((value, index, values) => value.length > 0 && values.indexOf(value) === index);

  return {
    name,
    category: category as CreateOrUpdateAlertInput["category"],
    keywordMode: keywordMode as CreateOrUpdateAlertInput["keywordMode"],
    keywords,
    locationId,
    locationLabel,
    latitude,
    longitude,
    radiusKm,
    enabled,
  };
}
