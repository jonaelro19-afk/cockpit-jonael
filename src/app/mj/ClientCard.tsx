"use client";
// Encadré infos client : lecture seule par défaut, bouton "Modifier" en bas
// à droite pour passer en édition, "Enregistrer" / "Annuler" ensuite.

import { useState } from "react";
import ClientForm from "./ClientForm";
import type { Client } from "@/generated/prisma/client";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3 py-2">
      <span className="w-28 shrink-0 text-xs text-muted">{label}</span>
      <span className="text-sm text-text">{value?.trim() ? value : "—"}</span>
    </div>
  );
}

export default function ClientCard({
  client,
  updateAction,
}: {
  client: Client;
  updateAction: (fd: FormData) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Informations
      </h2>

      {editing ? (
        <ClientForm
          action={updateAction}
          client={client}
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
          <div className="divide-y divide-line">
            <Row label="Nom" value={client.name} />
            <Row label="Société" value={client.company} />
            <Row label="Téléphone" value={client.phone} />
            <Row label="E-mail" value={client.email} />
            <Row label="Adresse" value={client.address} />
            <Row label="Notes" value={client.notes} />
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
