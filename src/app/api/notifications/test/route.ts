import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendNotifications } from "@/lib/notifications/service";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const windowMs = Number(process.env.NOTIFICATION_RATE_LIMIT_WINDOW_MS ?? "60000");
  const max = Number(process.env.NOTIFICATION_RATE_LIMIT_MAX ?? "10");
  const rate = checkRateLimit({ key: `notifications:${ip}`, windowMs, max });

  if (!rate.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const results = await sendNotifications({
    title: "Annonce de test",
    category: "test",
    location: "Drancy",
    detectedAt: new Date(),
    publishedAt: new Date(),
    listingUrl: "https://example.com/mock/test",
  });

  return NextResponse.json({ ok: true, results });
}
