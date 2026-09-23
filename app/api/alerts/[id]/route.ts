import { NextResponse } from "next/server";

import { parseAlertInput } from "@/lib/alerts-validation";
import { getAlertById, setAlertEnabled, updateAlert } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = await getAlertById(id);

  if (!alert) {
    return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 });
  }

  return NextResponse.json({ alert });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (Object.keys(body).length === 1 && typeof body.enabled === "boolean") {
      const alert = await setAlertEnabled(id, body.enabled);
      if (!alert) {
        return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 });
      }

      return NextResponse.json({ alert });
    }

    const input = parseAlertInput(body);
    const alert = await updateAlert(id, input);

    if (!alert) {
      return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 });
    }

    return NextResponse.json({ alert });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
