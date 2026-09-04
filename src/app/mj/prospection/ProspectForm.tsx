"use client";

import { useFormStatus } from "react-dom";
import {
  PROSPECT_SEGMENTS,
  PROSPECT_STATUSES,
} from "@/lib/prospection-shared";

type P = {
  name: string;
  segment: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  sector: string;
  headcount: number | null;
  budgetEur: number | null;
  eventsPerYear: number | null;
  firstContact: Date | string | null;
  lastContact: Date | string | null;
  status: string;
  notes: string;
};

const d = (v: Date | string | null) =>
  v ? new Date(v).toISOString().slice(0, 10) : "";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "…" : label}
    </button>
  );
}

export default function ProspectForm({
  action,
  prospect,
  submitLabel = "Enregistrer",
  secondary,
}: {
  action: (fd: FormData) => void | Promise<void>;
  prospect?: Partial<P>;
  submitLabel?: string;
  secondary?: React.ReactNode;
}) {
  const p = prospect ?? {};
  const field = "field w-full";
  const lbl = "mb-1 block text-xs font-medium text-muted";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div>
          <label className={lbl}>Nom de l&apos;entreprise *</label>
          <input name="name" required defaultValue={p.name ?? ""} className={field} />
        </div>
        <div>
          <label className={lbl}>Segment</label>
          <select name="segment" defaultValue={p.segment ?? "Autre"} className={field}>
            {PROSPECT_SEGMENTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>Contact</label>
          <input name="contactName" defaultValue={p.contactName ?? ""} className={field} />
        </div>
        <div>
          <label className={lbl}>Statut</label>
          <select name="status" defaultValue={p.status ?? "À contacter"} className={field}>
            {PROSPECT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Email</label>
          <input type="email" name="email" defaultValue={p.email ?? ""} className={field} />
        </div>
        <div>
          <label className={lbl}>Téléphone</label>
          <input name="phone" defaultValue={p.phone ?? ""} className={field} />
        </div>
        <div>
          <label className={lbl}>Site web</label>
          <input name="website" defaultValue={p.website ?? ""} className={field} />
        </div>
        <div>
          <label className={lbl}>Secteur d&apos;activité</label>
          <input name="sector" defaultValue={p.sector ?? ""} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>Adresse</label>
          <input name="address" defaultValue={p.address ?? ""} className={field} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={lbl}>Effectifs</label>
          <input type="number" name="headcount" defaultValue={p.headcount ?? ""} className={field} />
        </div>
        <div>
          <label className={lbl}>Budget vidéo estimé (€)</label>
          <input type="number" name="budgetEur" defaultValue={p.budgetEur ?? ""} className={field} />
        </div>
        <div>
          <label className={lbl}>Événements / an</label>
          <input type="number" name="eventsPerYear" defaultValue={p.eventsPerYear ?? ""} className={field} />
        </div>
        <div>
          <label className={lbl}>1er contact</label>
          <input type="date" name="firstContact" defaultValue={d(p.firstContact ?? null)} className={field} />
        </div>
        <div>
          <label className={lbl}>Dernier contact</label>
          <input type="date" name="lastContact" defaultValue={d(p.lastContact ?? null)} className={field} />
        </div>
      </div>

      <div>
        <label className={lbl}>Notes</label>
        <textarea name="notes" rows={3} defaultValue={p.notes ?? ""} className={`${field} resize-y`} />
      </div>

      <div className="flex items-center gap-2">
        <Submit label={submitLabel} />
        {secondary}
      </div>
    </form>
  );
}
