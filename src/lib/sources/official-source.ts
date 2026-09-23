import type { ListingSource } from "@/lib/sources/types";

export const officialGeevSourceAdapter: ListingSource = {
  name: "geev-official-placeholder",
  description:
    "Adaptateur placeholder. À implémenter uniquement en présence d'une API Geev officielle ou d'une autorisation explicite.",
  async fetchListings() {
    throw new Error(
      "Aucune API Geev officielle n'est configurée. Utilisez LISTING_SOURCE=mock tant qu'aucun accès autorisé n'est disponible.",
    );
  },
};
