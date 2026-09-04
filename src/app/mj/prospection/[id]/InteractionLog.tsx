"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Phone, Mail, Users, MessageSquare, Circle, Trash2 } from "lucide-react";
import { INTERACTION_KINDS, WHO_OPTIONS } from "@/lib/prospection-shared";
import { fmtDate } from "@/lib/mj-shared";
import { addInteraction, deleteInteraction } from "../actions";

type Interaction = {
  id: string;
  date: string;
  kind: string;
  who: string;
  summary: string;
  nextAt: string | null;
};

const KIND_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Appel: Phone,
  Email: Mail,
  Réunion: Users,
  Message: MessageSquare,
  Autre: Circle,
};

export default function InteractionLog({
  prospectId,
  interactions,
}: {
  prospectId: string;
  interactions: Interaction[];
}) {
  const [open, setOpen] = useState(interactions.length === 0);
  const [pending, start] = useTransition();
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">
          Historique{" "}
          <span className="font-normal text-faint">{interactions.length}</span>
        </h2>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-secondary"
          >
            <Plus size={14} /> Ajouter un échange
          </button>
        )}
      </div>

      {open && (
        <form
          action={(fd) =>
            start(async () => {
              await addInteraction(prospectId, fd);
              setOpen(interactions.length === 0);
              router.refresh();
            })
          }
          className="mb-4 space-y-3 rounded-card border border-line bg-surface p-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Date</label>
              <input type="date" name="date" defaultValue={today} className="field w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Type</label>
              <select name="kind" className="field w-full" defaultValue="Appel">
                {INTERACTION_KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Par</label>
              <select name="who" className="field w-full" defaultValue="Jonaël">
                {WHO_OPTIONS.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Résumé</label>
            <textarea
              name="summary"
              rows={2}
              placeholder="Ce qui s'est dit, la suite à donner…"
              className="field w-full resize-y"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Prochain RDV / relance <span className="text-faint">(facultatif)</span>
            </label>
            <input type="date" name="nextAt" className="field w-full sm:w-56" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
              {pending ? "…" : "Ajouter"}
            </button>
            {interactions.length > 0 && (
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                Annuler
              </button>
            )}
          </div>
        </form>
      )}

      <ol className="space-y-2">
        {interactions.map((it) => {
          const Icon = KIND_ICON[it.kind] ?? Circle;
          return (
            <li
              key={it.id}
              className="flex gap-3 rounded-field border border-line bg-surface px-3.5 py-2.5"
            >
              <Icon size={15} className="mt-0.5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">
                  {fmtDate(it.date)} · {it.kind}
                  {it.who ? ` · ${it.who}` : ""}
                </p>
                {it.summary && <p className="text-sm">{it.summary}</p>}
                {it.nextAt && (
                  <p className="mt-0.5 text-xs font-medium text-warn">
                    Prochain : {fmtDate(it.nextAt)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  start(async () => {
                    await deleteInteraction(it.id, prospectId);
                    router.refresh();
                  })
                }
                className="shrink-0 text-faint hover:text-live"
                aria-label="Supprimer"
              >
                <Trash2 size={13} />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
