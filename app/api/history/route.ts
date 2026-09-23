import { NextResponse } from "next/server";

import { listHistory } from "@/lib/storage";

export async function GET() {
  const history = await listHistory();
  return NextResponse.json({ history });
}
