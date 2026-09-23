"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-red-700">Une erreur est survenue</h2>
      <p className="text-sm text-zinc-700">{error.message}</p>
      <button onClick={reset} className="mt-3 rounded-md border border-zinc-300 px-4 py-2 text-sm">
        Réessayer
      </button>
    </div>
  );
}
