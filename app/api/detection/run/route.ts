import { NextResponse } from "next/server";

import { runDetectionCycle } from "@/lib/detection";

export async function POST() {
  try {
    const summary = await runDetectionCycle();
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
