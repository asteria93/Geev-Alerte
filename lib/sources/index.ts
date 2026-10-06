import { MockListingSource } from "@/lib/sources/mock-source";
import { GeevOfficialSource } from "@/lib/sources/official-source";
import type { ListingSource } from "@/lib/sources/types";

export function getListingSource(): ListingSource {
  if (process.env.LISTING_SOURCE === "geev-official") {
    return new GeevOfficialSource();
  }

  return new MockListingSource();
}
