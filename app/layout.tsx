import type { Metadata } from "next";
import "./globals.css";

import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Geev Alerte (démo)",
  description: "Surveillance de nouvelles annonces via source mock autorisée",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="layout">
          <header className="header">
            <h1>Geev Alerte</h1>
            <p className="subtitle">
              Démonstration fonctionnelle avec source d'annonces mock (aucune intégration Geev non officielle)
            </p>
            <Nav />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
