"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
  totalAlerts: number;
  activeAlerts: number;
  lastCheckAt: string | null;
  source: string;
  recentHistory: Array<{
    id: string;
    alertName: string;
    detectedAt: string;
    listing: { title: string; category: string; locationLabel: string; url: string };
    notificationResults: Array<{ channel: string; success: boolean; message: string }>;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function load() {
    setError(null);
    const response = await fetch("/api/dashboard", { cache: "no-store" });

    if (!response.ok) {
      setError("Impossible de charger le dashboard.");
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as DashboardData;
    setData(payload);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/dashboard", { cache: "no-store" });

      if (!response.ok) {
        setError("Impossible de charger le dashboard.");
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as DashboardData;
      setData(payload);
      setLoading(false);
    })();
  }, []);

  async function runDetection() {
    setRunning(true);
    setRunMessage(null);

    const response = await fetch("/api/detection/run", { method: "POST" });
    const payload = (await response.json()) as { newListings?: number; error?: string };

    if (!response.ok) {
      setRunMessage(`Erreur: ${payload.error ?? "échec"}`);
      setRunning(false);
      return;
    }

    setRunMessage(`Détection terminée: ${payload.newListings ?? 0} nouvelle(s) annonce(s).`);
    setRunning(false);
    await load();
  }

  if (loading) return <section className="card">Chargement du dashboard...</section>;
  if (error || !data) return <section className="card error">{error ?? "Erreur inconnue"}</section>;

  return (
    <section className="list">
      <div className="cards">
        <article className="card">
          <h2>Alertes actives</h2>
          <p>{data.activeAlerts}</p>
        </article>
        <article className="card">
          <h2>Total alertes</h2>
          <p>{data.totalAlerts}</p>
        </article>
        <article className="card">
          <h2>Source annonces</h2>
          <p>{data.source}</p>
        </article>
        <article className="card">
          <h2>Dernière vérification</h2>
          <p>{data.lastCheckAt ? new Date(data.lastCheckAt).toLocaleString() : "Jamais"}</p>
        </article>
      </div>

      <div className="actions">
        <button onClick={runDetection} disabled={running}>
          {running ? "Vérification..." : "Lancer une vérification"}
        </button>
        <Link href="/alertes/nouvelle" className="button secondary">
          Créer une alerte
        </Link>
      </div>

      {runMessage && <p className="card">{runMessage}</p>}

      <section className="card">
        <h2>Dernières annonces détectées</h2>
        {data.recentHistory.length === 0 ? (
          <p className="muted">Aucune annonce détectée pour l&apos;instant.</p>
        ) : (
          <ul>
            {data.recentHistory.map((item) => (
              <li key={item.id}>
                <strong>{item.listing.title}</strong> ({item.listing.category}) — {item.listing.locationLabel} •
                {" "}
                <a href={item.listing.url} target="_blank" rel="noreferrer">
                  voir
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
