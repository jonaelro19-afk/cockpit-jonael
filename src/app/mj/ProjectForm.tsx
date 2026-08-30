import type { ReactNode } from "react";
import type { Project, Client } from "@/generated/prisma/client";
import { PROJECT_KINDS, PROJECT_STATUSES } from "@/lib/mj-shared";

function toDateInput(d: Date | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}
// "AAAA-MM-JJTHH:MM" en heure locale, pour <input type="datetime-local">
function toDateTimeInput(d: Date | null) {
  if (!d) return "";
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(
    x.getHours(),
  )}:${pad(x.getMinutes())}`;
}

export default function ProjectForm({
  action,
  project,
  clients,
  submitLabel,
  secondaryAction,
  defaultClientId,
}: {
  action: (fd: FormData) => void | Promise<void>;
  project?: Project;
  clients: Client[];
  submitLabel: string;
  secondaryAction?: ReactNode;
  defaultClientId?: string;
}) {
  const label = "mb-1 block text-xs font-medium text-muted";

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={label}>Titre *</label>
        <input
          name="title"
          required
          defaultValue={project?.title ?? ""}
          placeholder="Film de mariage, shooting produits…"
          className="field"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Client</label>
          <select
            name="clientId"
            defaultValue={project?.clientId ?? defaultClientId ?? ""}
            className="field"
          >
            <option value="">— aucun —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Type</label>
          <select
            name="kind"
            defaultValue={project?.kind ?? "Vidéo"}
            className="field"
          >
            {PROJECT_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Statut</label>
          <select
            name="status"
            defaultValue={project?.status ?? "Devis"}
            className="field"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Date de tournage</label>
          <input
            type="date"
            name="shootDate"
            defaultValue={toDateInput(project?.shootDate ?? null)}
            className="field"
          />
        </div>
        <div>
          <label className={label}>Livraison (jour + heure)</label>
          <input
            type="datetime-local"
            name="deadline"
            defaultValue={toDateTimeInput(project?.deadline ?? null)}
            className="field"
          />
        </div>
        <div>
          <label className={label}>Budget (€)</label>
          <input
            type="number"
            name="budgetEur"
            min="0"
            step="10"
            defaultValue={project?.budgetEur ?? ""}
            className="field"
          />
        </div>
      </div>

      <div>
        <label className={label}>Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={project?.notes ?? ""}
          className="field"
        />
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
        {secondaryAction}
      </div>
    </form>
  );
}
