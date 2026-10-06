import { listMockListings } from "@/lib/storage";
import type { ListingSource } from "@/lib/sources/types";

export class MockListingSource implements ListingSource {
  readonly name = "mock";

  async getRecentListings() {
    return listMockListings();
  }
}
