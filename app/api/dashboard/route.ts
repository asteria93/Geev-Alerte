import { NextResponse } from "next/server";

import { getStore } from "@/lib/storage";
import { getListingSource } from "@/lib/sources";

export async function GET() {
  const store = await getStore();
  const source = getListingSource();

  return NextResponse.json({
    totalAlerts: store.alerts.length,
    activeAlerts: store.alerts.filter((item) => item.enabled).length,
    lastCheckAt: store.lastCheckAt,
    recentHistory: store.history.slice(0, 5),
    source: source.name,
  });
}
