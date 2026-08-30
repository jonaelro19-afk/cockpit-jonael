"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-live/15 text-live">
        <TriangleAlert size={30} strokeWidth={1.5} />
      </span>
      <p className="text-2xl font-extrabold tracking-tight">Une erreur est survenue</p>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Quelque chose s&apos;est mal passé sur cette page.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Réessayer
      </button>
    </div>
  );
}
