import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-xl font-semibold">Page introuvable</h2>
      <p className="text-sm text-zinc-600">La ressource demandée n&apos;existe pas.</p>
      <Link href="/" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
