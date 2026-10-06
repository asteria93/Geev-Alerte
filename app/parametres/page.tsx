"use client";

import { useEffect, useState } from "react";

type SettingsPayload = {
  settings: {
    mockEnabled: boolean;
    discordEnabled: boolean;
  };
  discordConfigured: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/settings/notifications", { cache: "no-store" });
      if (!response.ok) {
        setLoading(false);
        return;
      }

      setSettings((await response.json()) as SettingsPayload);
      setLoading(false);
    })();
  }, []);

  if (loading || !settings) {
    return <section className="card">Chargement des paramètres...</section>;
  }

  async function save() {
    if (!settings) return;
    setMessage(null);
    const response = await fetch("/api/settings/notifications", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings.settings),
    });

    if (!response.ok) {
      setMessage("Échec de sauvegarde.");
      return;
    }

    setSettings((await response.json()) as SettingsPayload);
    setMessage("Paramètres sauvegardés.");
  }

  async function injectListing() {
    const response = await fetch("/api/mock/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: `Annonce fictive ${new Date().toLocaleTimeString()}`,
        description: "Ajout manuel pour tester la détection.",
        category: "jeux-video",
        locationLabel: "Paris 75010",
        latitude: 48.8769,
        longitude: 2.3591,
        url: "https://example.invalid/manual-demo",
      }),
    });

    setMessage(response.ok ? "Nouvelle annonce fictive injectée." : "Injection impossible.");
  }

  return (
    <section className="list">
      <section className="card form-stack">
        <h2>Paramètres des notifications</h2>
        <label className="inline-row">
          <input
            type="checkbox"
            checked={settings.settings.mockEnabled}
            onChange={(event) =>
              setSettings((current) =>
                current
                  ? {
                      ...current,
                      settings: { ...current.settings, mockEnabled: event.target.checked },
                    }
                  : current,
              )
            }
          />
          Activer les notifications mock
        </label>

        <label className="inline-row">
          <input
            type="checkbox"
            checked={settings.settings.discordEnabled}
            onChange={(event) =>
              setSettings((current) =>
                current
                  ? {
                      ...current,
                      settings: { ...current.settings, discordEnabled: event.target.checked },
                    }
                  : current,
              )
            }
          />
          Activer Discord
        </label>
        <p className="muted">
          Webhook Discord {settings.discordConfigured ? "configuré via DISCORD_WEBHOOK_URL" : "non configuré"}.
        </p>

        <div className="actions">
          <button onClick={save}>Sauvegarder</button>
          <button className="secondary" onClick={injectListing}>
            Injecter une annonce fictive
          </button>
        </div>

        {message && <p>{message}</p>}
      </section>
    </section>
  );
}
