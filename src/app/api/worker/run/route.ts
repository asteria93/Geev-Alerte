import { NextRequest, NextResponse } from "next/server";
import { runDetectionCycle } from "@/lib/worker/run-detection-cycle";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const windowMs = Number(process.env.WORKER_RATE_LIMIT_WINDOW_MS ?? "60000");
  const max = Number(process.env.WORKER_RATE_LIMIT_MAX ?? "5");

  const rate = checkRateLimit({ key: `worker:${ip}`, windowMs, max });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Trop de requêtes worker" }, { status: 429 });
  }

  const result = await runDetectionCycle();
  if (!result.ok) {
    if (request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
      return NextResponse.redirect(new URL("/settings/notifications", request.url), { status: 303 });
    }
    return NextResponse.json(result, { status: 400 });
  }

  if (request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
    return NextResponse.redirect(new URL("/history", request.url), { status: 303 });
  }

  return NextResponse.json(result);
}
