"use client";

import { useTransition } from "react";
import { deleteTarif } from "./actions";
import { fmtMoney } from "@/lib/mj-shared";
import type { TarifItem } from "@/generated/prisma/client";

export default function TarifRow({ tarif }: { tarif: TarifItem }) {
  const [pending, start] = useTransition();
  return (
    <li
      className={`flex items-center gap-3 py-2 text-sm ${pending ? "opacity-40" : ""}`}
    >
      <span className="flex-1">
        {tarif.label}
        {tarif.category && (
          <span className="ml-2 text-xs text-muted">{tarif.category}</span>
        )}
      </span>
      <span className="tabular-nums text-muted">
        {fmtMoney(tarif.unitPrice)} / {tarif.unit}
      </span>
      <button
        type="button"
        onClick={() => start(() => deleteTarif(tarif.id))}
        className="text-muted hover:text-live"
        aria-label="Supprimer"
      >
        ✕
      </button>
    </li>
  );
}
