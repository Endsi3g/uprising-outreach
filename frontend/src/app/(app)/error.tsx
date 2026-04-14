"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-2xl mb-6">
        ⚠
      </div>
      <h2 className="text-xl font-medium font-serif text-[--color-text] mb-2">
        Erreur de chargement
      </h2>
      <p className="text-sm text-[--color-text-secondary] mb-2 max-w-sm leading-relaxed">
        {error.message || "Une erreur inattendue est survenue lors du rendu de cette page."}
      </p>
      {error.digest && (
        <p className="text-[11px] text-[--color-text-tertiary] font-mono mb-6">
          code: {error.digest}
        </p>
      )}
      <Button variant="secondary" size="sm" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
