import { NextResponse } from "next/server";

import { parseAlertInput } from "@/lib/alerts-validation";
import { createAlert, listAlerts } from "@/lib/storage";

export async function GET() {
  const alerts = await listAlerts();
  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseAlertInput(body);
    const alert = await createAlert(input);

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
