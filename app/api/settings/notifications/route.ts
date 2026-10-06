import { NextResponse } from "next/server";

import { getNotificationSettings, updateNotificationSettings } from "@/lib/storage";

export async function GET() {
  const settings = await getNotificationSettings();
  const discordConfigured = Boolean(process.env.DISCORD_WEBHOOK_URL);

  return NextResponse.json({
    settings,
    discordConfigured,
  });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const settings = await updateNotificationSettings({
      mockEnabled: Boolean(body.mockEnabled),
      discordEnabled: Boolean(body.discordEnabled),
    });

    return NextResponse.json({
      settings,
      discordConfigured: Boolean(process.env.DISCORD_WEBHOOK_URL),
    });
  } catch {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }
}
