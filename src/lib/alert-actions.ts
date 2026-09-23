"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseCoordinates } from "@/lib/alerts/filter";
import { alertFormSchema } from "@/lib/validation";

function toStringArray(value: FormDataEntryValue | null) {
  if (!value) return [];
  return value
    .toString()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAlertInput(formData: FormData) {
  const payload = {
    name: formData.get("name")?.toString() ?? "",
    categories: toStringArray(formData.get("categories")),
    keywords: toStringArray(formData.get("keywords")),
    keywordMode: formData.get("keywordMode")?.toString() === "ALL" ? "ALL" : "ANY",
    locationType: (formData.get("locationType")?.toString() ?? "CITY") as "CITY" | "POSTAL_CODE" | "COORDINATES",
    locationValue: formData.get("locationValue")?.toString() ?? "",
    radiusKm: Number(formData.get("radiusKm")?.toString() ?? "5"),
    frequencyMinutes: Number(formData.get("frequencyMinutes")?.toString() ?? "10"),
    isActive: formData.get("isActive")?.toString() === "on",
  };

  return alertFormSchema.parse(payload);
}

function locationPayload(locationType: string, locationValue: string) {
  if (locationType !== "COORDINATES") {
    return { latitude: null, longitude: null };
  }

  const parsed = parseCoordinates(locationValue);
  if (!parsed) {
    return { latitude: null, longitude: null };
  }

  return parsed;
}

export async function createAlertAction(formData: FormData) {
  const payload = normalizeAlertInput(formData);
  const coordinates = locationPayload(payload.locationType, payload.locationValue);

  await prisma.alert.create({
    data: {
      ...payload,
      categories: payload.categories,
      keywords: payload.keywords,
      ...coordinates,
    },
  });

  revalidatePath("/");
  revalidatePath("/alerts");
}

export async function updateAlertAction(id: string, formData: FormData) {
  const payload = normalizeAlertInput(formData);
  const coordinates = locationPayload(payload.locationType, payload.locationValue);

  await prisma.alert.update({
    where: { id },
    data: {
      ...payload,
      categories: payload.categories,
      keywords: payload.keywords,
      ...coordinates,
    },
  });

  revalidatePath("/");
  revalidatePath("/alerts");
  revalidatePath(`/alerts/${id}/edit`);
}

export async function deleteAlertAction(id: string) {
  await prisma.alert.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/alerts");
}
