"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  alertName: string;
  detectedAt: string;
  listing: {
    title: string;
    category: string;
    locationLabel: string;
    url: string;
  };
  notificationResults: Array<{ channel: string; success: boolean; message: string }>;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/history", { cache: "no-store" });
      if (!response.ok) {
        setError("Impossible de charger l'historique.");
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as { history: HistoryItem[] };
      setItems(payload.history);
      setLoading(false);
    })();
  }, []);

  if (loading) return <section className="card">Chargement de l'historique...</section>;
  if (error) return <section className="card error">{error}</section>;

  return (
    <section className="list">
      <section className="card">
        <h2>Historique des annonces détectées</h2>
        {items.length === 0 ? (
          <p className="muted">Aucune annonce détectée pour le moment.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.listing.title}</strong> ({item.listing.category}) via {item.alertName}
                <br />
                {item.listing.locationLabel} — {new Date(item.detectedAt).toLocaleString()} —
                {" "}
                <a href={item.listing.url} target="_blank" rel="noreferrer">
                  ouvrir l'annonce
                </a>
                <br />
                Notifications: {item.notificationResults.map((result) => `${result.channel}:${result.success ? "ok" : "ko"}`).join(", ") || "aucune"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
