"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Phone, Mail, Globe, MapPin } from "lucide-react";
import { fmtEur0 } from "@/lib/prospection-shared";
import { fmtDate } from "@/lib/mj-shared";
import ProspectForm from "../ProspectForm";
import { updateProspect, deleteProspect } from "../actions";

type P = Parameters<typeof ProspectForm>[0]["prospect"] & {
  id: string;
  firstContact: string | null;
  lastContact: string | null;
};

export default function ProspectDetail({ prospect }: { prospect: P }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const p = prospect!;

  if (editing) {
    return (
      <div className="rounded-card border border-line bg-surface p-5">
        <ProspectForm
          action={(fd) =>
            start(async () => {
              await updateProspect(p.id, fd);
              setEditing(false);
              router.refresh();
            })
          }
          prospect={p}
          submitLabel="Enregistrer"
          secondary={
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
          }
        />
      </div>
    );
  }

  const line = (
    Icon: React.ComponentType<{ size?: number; className?: string }>,
    value?: string | null,
    href?: string,
  ) =>
    value ? (
      <p className="flex items-center gap-2 text-sm">
        <Icon size={14} className="shrink-0 text-muted" />
        {href ? (
          <a href={href} className="hover:underline" target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ) : (
          value
        )}
      </p>
    ) : null;

  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {p.segment}
          </p>
          {p.contactName && (
            <p className="text-sm font-medium">{p.contactName}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="btn-secondary shrink-0"
        >
          <Pencil size={14} /> Modifier
        </button>
      </div>

      <div className="space-y-1.5">
        {line(Phone, p.phone || null, p.phone ? `tel:${p.phone}` : undefined)}
        {line(Mail, p.email || null, p.email ? `mailto:${p.email}` : undefined)}
        {line(
          Globe,
          p.website || null,
          p.website
            ? p.website.startsWith("http")
              ? p.website
              : `https://${p.website}`
            : undefined,
        )}
        {line(MapPin, p.address || null)}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <Info k="Secteur" v={p.sector || "—"} />
        <Info k="Effectifs" v={p.headcount ? String(p.headcount) : "—"} />
        <Info k="Budget estimé" v={fmtEur0(p.budgetEur)} />
        <Info k="Événements / an" v={p.eventsPerYear ? String(p.eventsPerYear) : "—"} />
        <Info k="1er contact" v={p.firstContact ? fmtDate(p.firstContact) : "—"} />
        <Info k="Dernier contact" v={p.lastContact ? fmtDate(p.lastContact) : "—"} />
      </dl>

      {p.notes && (
        <p className="mt-4 whitespace-pre-wrap rounded-field bg-surface-2 p-3 text-sm text-muted">
          {p.notes}
        </p>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`Supprimer « ${p.name} » et son historique ?`))
            start(() => deleteProspect(p.id));
        }}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-live hover:underline disabled:opacity-50"
      >
        <Trash2 size={13} /> Supprimer ce prospect
      </button>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-faint">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
