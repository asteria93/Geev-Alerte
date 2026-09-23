import { prisma } from "@/lib/db";
import type { ListingSource } from "@/lib/sources/types";

export const mockListingSource: ListingSource = {
  name: "mock",
  description:
    "Source de développement. Les annonces proviennent de la table MockListing alimentée manuellement.",
  async fetchListings() {
    const listings = await prisma.mockListing.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    return listings.map((listing) => ({
      stableId: listing.stableId,
      title: listing.title,
      category: listing.category,
      city: listing.city,
      postalCode: listing.postalCode,
      latitude: listing.latitude,
      longitude: listing.longitude,
      publishedAt: listing.publishedAt,
      imageUrl: listing.imageUrl,
      listingUrl: listing.listingUrl,
    }));
  },
};
