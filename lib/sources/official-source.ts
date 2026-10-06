import type { ListingSource } from "@/lib/sources/types";
import type { Listing } from "@/lib/types";

export class GeevOfficialSource implements ListingSource {
  readonly name = "geev-official-disabled";

  async getRecentListings(): Promise<Listing[]> {
    throw new Error(
      "Aucune API Geev officielle autorisée n'est configurée. La source réelle Geev reste désactivée.",
    );
  }
}
