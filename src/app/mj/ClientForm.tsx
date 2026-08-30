import type { ReactNode } from "react";
import type { Client } from "@/generated/prisma/client";

export default function ClientForm({
  action,
  client,
  submitLabel,
  secondaryAction,
}: {
  action: (fd: FormData) => void | Promise<void>;
  client?: Client;
  submitLabel: string;
  secondaryAction?: ReactNode;
}) {
  const label = "mb-1 block text-xs font-medium text-muted";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nom *</label>
          <input
            name="name"
            required
            defaultValue={client?.name ?? ""}
            className="field"
          />
        </div>
        <div>
          <label className={label}>Société</label>
          <input
            name="company"
            defaultValue={client?.company ?? ""}
            className="field"
          />
        </div>
        <div>
          <label className={label}>Téléphone</label>
          <input
            name="phone"
            type="tel"
            defaultValue={client?.phone ?? ""}
            className="field"
          />
        </div>
        <div>
          <label className={label}>E-mail</label>
          <input
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            className="field"
          />
        </div>
      </div>
      <div>
        <label className={label}>Adresse</label>
        <input
          name="address"
          defaultValue={client?.address ?? ""}
          className="field"
        />
      </div>
      <div>
        <label className={label}>Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={client?.notes ?? ""}
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
