"use client";
// Bouton « À revoir » : bascule le marque-page d'une notion.

import { useState, useTransition } from "react";
import { toggleBookmark } from "@/app/bts/actions";

export default function BookmarkButton({
  notionId,
  initial,
}: {
  notionId: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !on;
        setOn(next); // retour visuel immédiat
        startTransition(() => toggleBookmark(notionId, next));
      }}
      className={`chip border transition-colors disabled:opacity-50 ${
        on
          ? "border-amber-400/40 bg-amber-400/15 text-amber-300"
          : "border-line text-muted hover:bg-surface-2"
      }`}
      aria-pressed={on}
    >
      <span>{on ? "★" : "☆"}</span>
      <span>{on ? "À revoir" : "Marquer à revoir"}</span>
    </button>
  );
}
