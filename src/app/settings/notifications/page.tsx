import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { notificationSettingsSchema } from "@/lib/validation";

async function saveSettings(formData: FormData) {
  "use server";

  const payload = notificationSettingsSchema.parse({
    discordEnabled: formData.get("discordEnabled")?.toString() === "on",
    webPushEnabled: formData.get("webPushEnabled")?.toString() === "on",
    telegramEnabled: formData.get("telegramEnabled")?.toString() === "on",
    emailEnabled: formData.get("emailEnabled")?.toString() === "on",
    discordWebhookUrl: formData.get("discordWebhookUrl")?.toString().trim() ?? "",
  });

  await prisma.notificationSettings.upsert({
    where: { id: 1 },
    update: payload,
    create: { id: 1, ...payload },
  });

  revalidatePath("/settings/notifications");
}

export default async function NotificationSettingsPage() {
  const settings = await prisma.notificationSettings.findUnique({ where: { id: 1 } });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Paramètres des notifications</h2>

      <form action={saveSettings} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
        <label className="block text-sm font-medium">
          Webhook Discord (serveur uniquement)
          <input
            name="discordWebhookUrl"
            defaultValue={settings?.discordWebhookUrl ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
            placeholder="https://discord.com/api/webhooks/..."
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="discordEnabled" defaultChecked={settings?.discordEnabled ?? false} />
            Activer Discord
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="webPushEnabled" defaultChecked={settings?.webPushEnabled ?? false} />
            Activer Web Push
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="telegramEnabled" defaultChecked={settings?.telegramEnabled ?? false} />
            Activer Telegram (extension)
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="emailEnabled" defaultChecked={settings?.emailEnabled ?? false} />
            Activer e-mail (extension)
          </label>
        </div>

        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">
          Enregistrer
        </button>
      </form>

      <form action="/api/notifications/test" method="post" className="rounded-xl border border-zinc-200 bg-white p-4">
        <button type="submit" className="rounded-md border border-zinc-300 px-4 py-2 text-sm">
          Tester une notification
        </button>
      </form>

      <form action="/api/mock/listings" method="post" className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-semibold">Ajouter une annonce mock</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="stableId" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="stable-id" required />
          <input name="title" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Titre" required />
          <input name="category" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="electronique" required />
          <input name="city" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Ville" required />
          <input name="postalCode" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Code postal" />
          <input name="listingUrl" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="https://..." required />
          <input name="imageUrl" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="https://image..." />
          <input name="latitude" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Latitude" />
          <input name="longitude" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Longitude" />
        </div>
        <button type="submit" className="rounded-md border border-zinc-300 px-4 py-2 text-sm">
          Ajouter l&apos;annonce mock
        </button>
      </form>

      <form action="/api/worker/run" method="post" className="rounded-xl border border-zinc-200 bg-white p-4">
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">
          Lancer le worker maintenant
        </button>
      </form>
    </section>
  );
}
