import { NextResponse } from "next/server";

import { addMockListing, listMockListings } from "@/lib/storage";
import { CATEGORIES } from "@/lib/types";

export async function GET() {
  const listings = await listMockListings();
  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const category = String(body.category ?? "");

    if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      return NextResponse.json({ error: "Catégorie invalide" }, { status: 400 });
    }

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
    }

    const listing = await addMockListing({
      title: String(body.title ?? "Annonce fictive"),
      description: String(body.description ?? "Ajoutée pour test de détection"),
      category: category as (typeof CATEGORIES)[number],
      locationLabel: String(body.locationLabel ?? "Zone démo"),
      latitude,
      longitude,
      url: String(body.url ?? "https://example.invalid/mock"),
      imageUrl: undefined,
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
}
