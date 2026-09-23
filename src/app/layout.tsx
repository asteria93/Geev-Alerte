import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Geev Alerte",
  description: "Surveillance d&apos;annonces via source mock et architecture extensible.",
};

const links = [
  { href: "/", label: "Tableau de bord" },
  { href: "/alerts", label: "Mes alertes" },
  { href: "/history", label: "Historique" },
  { href: "/settings/notifications", label: "Notifications" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
          <header className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
            <h1 className="text-2xl font-bold">Geev Alerte</h1>
            <p className="text-sm text-zinc-600">
              Détection d&apos;annonces via source mock, sans contournement ni scraping non autorisé.
            </p>
            <nav className="mt-4 flex flex-wrap gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
