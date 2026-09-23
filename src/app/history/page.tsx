import { prisma } from "@/lib/db";

export default async function HistoryPage() {
  const history = await prisma.detectedListing.findMany({
    orderBy: { detectedAt: "desc" },
    take: 100,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Historique des annonces détectées</h2>
      {history.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          Aucun historique pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-zinc-600">
                {item.category} · {item.location}
              </p>
              <p className="text-sm text-zinc-600">
                Publié: {item.publishedAt?.toLocaleString() ?? "inconnu"} · Détecté: {item.detectedAt.toLocaleString()}
              </p>
              <a href={item.listingUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-700 hover:underline">
                Voir l&apos;annonce
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
