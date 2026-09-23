import type { ListingSource } from "@/lib/sources/types";
import { mockListingSource } from "@/lib/sources/mock-source";
import { officialGeevSourceAdapter } from "@/lib/sources/official-source";

const sources = new Map<string, ListingSource>([
  [mockListingSource.name, mockListingSource],
  ["mock", mockListingSource],
  [officialGeevSourceAdapter.name, officialGeevSourceAdapter],
  ["geev-official", officialGeevSourceAdapter],
]);

export function getListingSource() {
  const configured = process.env.LISTING_SOURCE ?? "mock";
  return sources.get(configured) ?? mockListingSource;
}
