import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mockListingSchema } from "@/lib/validation";

function toOptionalNumber(value: string | null) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isForm = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");

  const body = isForm ? Object.fromEntries((await request.formData()).entries()) : await request.json();

  const parsed = mockListingSchema.safeParse({
    stableId: body.stableId?.toString(),
    title: body.title?.toString(),
    category: body.category?.toString(),
    city: body.city?.toString(),
    postalCode: body.postalCode?.toString() || undefined,
    latitude: toOptionalNumber(body.latitude?.toString() ?? null),
    longitude: toOptionalNumber(body.longitude?.toString() ?? null),
    listingUrl: body.listingUrl?.toString(),
    imageUrl: body.imageUrl?.toString() || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.mockListing.upsert({
    where: { stableId: parsed.data.stableId },
    update: parsed.data,
    create: parsed.data,
  });

  if (isForm) {
    return NextResponse.redirect(new URL("/settings/notifications", request.url), { status: 303 });
  }

  return NextResponse.json({ ok: true });
}
