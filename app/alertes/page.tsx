"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Alert = {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  keywordMode: "ANY" | "ALL";
  locationLabel: string;
  radiusKm: number;
  enabled: boolean;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/alerts", { cache: "no-store" });

    if (!response.ok) {
      setError("Impossible de charger les alertes.");
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as { alerts: Alert[] };
    setAlerts(payload.alerts);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, []);

  async function toggleAlert(alert: Alert) {
    const response = await fetch(`/api/alerts/${alert.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: !alert.enabled }),
    });

    if (response.ok) {
      await load();
    }
  }

  if (loading) return <section className="card">Chargement des alertes...</section>;
  if (error) return <section className="card error">{error}</section>;

  return (
    <section className="list">
      <div className="actions">
        <Link href="/alertes/nouvelle" className="button">
          Créer une alerte
        </Link>
      </div>

      {alerts.length === 0 ? (
        <section className="card muted">Aucune alerte configurée.</section>
      ) : (
        alerts.map((alert) => (
          <article key={alert.id} className="card">
            <h2>{alert.name}</h2>
            <p>
              {alert.category} • {alert.locationLabel} • {alert.radiusKm} km
            </p>
            <p>
              Mots-clés ({alert.keywordMode}): {alert.keywords.length ? alert.keywords.join(", ") : "aucun"}
            </p>
            <div className="actions">
              <button onClick={() => toggleAlert(alert)} className="secondary">
                {alert.enabled ? "Désactiver" : "Activer"}
              </button>
              <Link className="button secondary" href={`/alertes/${alert.id}/edit`}>
                Éditer
              </Link>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
