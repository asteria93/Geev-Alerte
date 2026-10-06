import type { Listing } from "@/lib/types";

export interface ListingSource {
  readonly name: string;
  getRecentListings(): Promise<Listing[]>;
}
