"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import EquipmentForm from "./EquipmentForm";
import { fmtEur, PRIORITY_LABEL } from "@/lib/mj-shared";
import type { Equipment } from "@/generated/prisma/client";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3 py-2">
      <span className="w-32 shrink-0 text-xs text-muted">{label}</span>
      <span className="text-sm text-text">{value?.trim() ? value : "—"}</span>
    </div>
  );
}

export default function EquipmentCard({
  item,
  updateAction,
}: {
  item: Equipment;
  updateAction: (fd: FormData) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const wishlist = item.status !== "possédé";

  return (
    <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Matériel
      </h2>

      {editing ? (
        <EquipmentForm
          action={updateAction}
          item={item}
          submitLabel="Enregistrer"
          secondaryAction={
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-ghost"
            >
              Annuler
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2">
            <Badge color={wishlist ? "amber" : "green"}>
              {wishlist ? "À acheter" : "Possédé"}
            </Badge>
            <span className="text-xs text-muted">{item.category}</span>
          </div>
          <div className="divide-y divide-line">
            <Row label="Nom" value={item.name} />
            <Row
              label={wishlist ? "Prix estimé" : "Prix d'achat"}
              value={fmtEur(item.priceEur)}
            />
            <Row label="Référence / n° série" value={item.reference} />
            {wishlist ? (
              <Row
                label="Priorité"
                value={PRIORITY_LABEL[item.priority] ?? "moyenne"}
              />
            ) : (
              <Row label="État" value={item.condition} />
            )}
            {wishlist ? (
              <Row label="Lien" value={item.url} />
            ) : (
              <Row
                label="Acheté le"
                value={
                  item.purchasedAt
                    ? new Date(item.purchasedAt).toLocaleDateString("fr-FR")
                    : null
                }
              />
            )}
            <Row label="Notes" value={item.notes} />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-secondary"
            >
              Modifier
            </button>
          </div>
        </>
      )}
    </section>
  );
}
