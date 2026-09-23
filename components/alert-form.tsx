"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LOCATION_PRESETS, RADIUS_OPTIONS_KM } from "@/lib/constants";
import { CATEGORIES } from "@/lib/types";
import type { Alert } from "@/lib/types";

type AlertFormProps = {
  mode: "create" | "edit";
  initialValue?: Alert;
};

export function AlertForm({ mode, initialValue }: AlertFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialValue?.name ?? "");
  const [category, setCategory] = useState(initialValue?.category ?? CATEGORIES[0]);
  const [keywords, setKeywords] = useState(initialValue?.keywords.join(", ") ?? "");
  const [keywordMode, setKeywordMode] = useState(initialValue?.keywordMode ?? "ANY");
  const [locationId, setLocationId] = useState(initialValue?.locationId ?? LOCATION_PRESETS[0].id);
  const [radiusKm, setRadiusKm] = useState(initialValue?.radiusKm ?? RADIUS_OPTIONS_KM[2]);
  const [enabled, setEnabled] = useState(initialValue?.enabled ?? true);

  const selectedLocation = LOCATION_PRESETS.find((location) => location.id === locationId) ?? LOCATION_PRESETS[0];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      category,
      keywords: keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      keywordMode,
      locationId: selectedLocation.id,
      locationLabel: selectedLocation.label,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      radiusKm,
      enabled,
    };

    const endpoint = mode === "create" ? "/api/alerts" : `/api/alerts/${initialValue?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Impossible de sauvegarder l'alerte.");
      setLoading(false);
      return;
    }

    router.push("/alertes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card form-stack">
      <h2>{mode === "create" ? "Créer une alerte" : "Modifier une alerte"}</h2>

      <label>
        Nom
        <input value={name} onChange={(event) => setName(event.target.value)} required minLength={3} />
      </label>

      <label>
        Catégorie
        <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Mots-clés (séparés par des virgules)
        <input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="PS4, pokemon" />
      </label>

      <fieldset>
        <legend>Mode mots-clés</legend>
        <label>
          <input
            type="radio"
            value="ANY"
            checked={keywordMode === "ANY"}
            onChange={() => setKeywordMode("ANY")}
          />
          ANY (au moins un)
        </label>
        <label>
          <input
            type="radio"
            value="ALL"
            checked={keywordMode === "ALL"}
            onChange={() => setKeywordMode("ALL")}
          />
          ALL (tous)
        </label>
      </fieldset>

      <label>
        Localisation
        <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
          {LOCATION_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Rayon (km)
        <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))}>
          {RADIUS_OPTIONS_KM.map((option) => (
            <option key={option} value={option}>
              {option} km
            </option>
          ))}
        </select>
      </label>

      <label className="inline-row">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
        Alerte active
      </label>

      {error && <p className="error">{error}</p>}

      <button disabled={loading} type="submit">
        {loading ? "Sauvegarde..." : "Enregistrer"}
      </button>
    </form>
  );
}
