import Link from "next/link";
import { prisma } from "@/lib/db";
import { getListingSource } from "@/lib/sources";

export default async function DashboardPage() {
  const [activeAlerts, latestDetections, workerState] = await Promise.all([
    prisma.alert.count({ where: { isActive: true } }),
    prisma.detectedListing.findMany({ orderBy: { detectedAt: "desc" }, take: 5 }),
    prisma.workerState.findUnique({ where: { id: 1 } }),
  ]);

  const source = getListingSource();

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Alertes actives</p>
          <p className="text-3xl font-bold">{activeAlerts}</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Source active</p>
          <p className="text-xl font-semibold">{source.name}</p>
          <p className="text-xs text-zinc-500">{source.description}</p>
        </article>
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">État surveillance</p>
          <p className="text-xl font-semibold">{workerState?.status ?? "IDLE"}</p>
          <p className="text-xs text-zinc-500">
            Dernière vérification: {workerState?.lastRunAt?.toLocaleString() ?? "jamais"}
          </p>
        </article>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Dernières annonces détectées</h2>
          <Link href="/history" className="text-sm text-blue-700 hover:underline">
            Voir tout
          </Link>
        </div>
        {latestDetections.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Aucun résultat pour le moment. Ajoutez une annonce mock puis lancez le worker.
          </p>
        ) : (
          <ul className="space-y-2">
            {latestDetections.map((item) => (
              <li key={item.id} className="rounded-md border border-zinc-200 p-3 text-sm">
                <p className="font-medium">{item.title}</p>
                <p className="text-zinc-600">
                  {item.category} · {item.location} · {item.detectedAt.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/alerts/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">
          Créer une alerte
        </Link>
        <Link href="/settings/notifications" className="rounded-md border border-zinc-300 px-4 py-2 text-sm">
          Paramètres notifications
        </Link>
      </div>
    </section>
  );
}
