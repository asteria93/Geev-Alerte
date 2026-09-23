import { CATEGORIES, FREQUENCY_OPTIONS, RADIUS_OPTIONS } from "@/lib/constants";

type AlertFormProps = {
  defaultValues?: {
    name: string;
    categories: string[];
    keywords: string[];
    keywordMode: "ANY" | "ALL";
    locationType: "CITY" | "POSTAL_CODE" | "COORDINATES";
    locationValue: string;
    radiusKm: number;
    frequencyMinutes: number;
    isActive: boolean;
  };
  submitLabel: string;
  action: (formData: FormData) => void;
};

export function AlertForm({ defaultValues, submitLabel, action }: AlertFormProps) {
  return (
    <form action={action} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
      <div>
        <label className="text-sm font-medium">Nom de l&apos;alerte</label>
        <input
          name="name"
          defaultValue={defaultValues?.name}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Catégories (séparées par des virgules)</label>
        <input
          name="categories"
          defaultValue={defaultValues?.categories.join(",")}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder={CATEGORIES.join(",")}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Mots-clés (facultatif, séparés par des virgules)</label>
        <input
          name="keywords"
          defaultValue={defaultValues?.keywords.join(",")}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="PS4, pokemon, iphone"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Mode mots-clés</label>
          <select
            name="keywordMode"
            defaultValue={defaultValues?.keywordMode ?? "ANY"}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          >
            <option value="ANY">ANY (au moins un)</option>
            <option value="ALL">ALL (tous)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Type de localisation</label>
          <select
            name="locationType"
            defaultValue={defaultValues?.locationType ?? "CITY"}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          >
            <option value="CITY">Ville</option>
            <option value="POSTAL_CODE">Code postal</option>
            <option value="COORDINATES">Coordonnées (lat,lng)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Valeur de localisation</label>
        <input
          name="locationValue"
          defaultValue={defaultValues?.locationValue}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Paris ou 75010 ou 48.8566,2.3522"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Rayon</label>
          <select
            name="radiusKm"
            defaultValue={defaultValues?.radiusKm ?? 5}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          >
            {RADIUS_OPTIONS.map((radius) => (
              <option key={radius} value={radius}>
                {radius} km
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Fréquence de vérification</label>
          <select
            name="frequencyMinutes"
            defaultValue={defaultValues?.frequencyMinutes ?? 10}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          >
            {FREQUENCY_OPTIONS.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency} minutes
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
        Alerte active
      </label>

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
