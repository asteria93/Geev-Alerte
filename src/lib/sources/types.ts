import type { SourceListing } from "@/lib/alerts/filter";

export type ListingSourceContext = {
  now: Date;
};

export interface ListingSource {
  name: string;
  fetchListings(context: ListingSourceContext): Promise<SourceListing[]>;
  description: string;
}
