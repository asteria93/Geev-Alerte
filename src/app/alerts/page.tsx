import Link from "next/link";
import { deleteAlertAction } from "@/lib/alert-actions";
import { prisma } from "@/lib/db";

export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mes alertes</h2>
        <Link href="/alerts/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">
          Nouvelle alerte
        </Link>
      </div>

      {alerts.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          Aucune alerte configurée.
        </p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{alert.name}</p>
                  <p className="text-sm text-zinc-600">
                    {(alert.categories as string[]).join(", ")} · mode {alert.keywordMode} · {alert.frequencyMinutes} min
                  </p>
                  <p className="text-sm text-zinc-600">
                    {alert.locationType}: {alert.locationValue} · Rayon {alert.radiusKm} km
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/alerts/${alert.id}/edit`}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-sm"
                  >
                    Modifier
                  </Link>
                  <form action={deleteAlertAction.bind(null, alert.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-2 inline-block rounded bg-zinc-100 px-2 py-1 text-xs">
                {alert.isActive ? "Active" : "Inactive"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
