"use client";

import { useTransition } from "react";
import { markPurchased } from "./actions";

export default function PurchasedButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => markPurchased(id))}
      className="chip border border-line text-muted hover:bg-surface-2 disabled:opacity-50"
    >
      {pending ? "…" : "✓ Acheté"}
    </button>
  );
}
