import type { ReactNode } from "react";
import type { Equipment } from "@/generated/prisma/client";
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
} from "@/lib/mj-shared";

function toDateInput(d: Date | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function EquipmentForm({
  action,
  item,
  defaultStatus,
  submitLabel,
  secondaryAction,
}: {
  action: (fd: FormData) => void | Promise<void>;
  item?: Equipment;
  defaultStatus?: string;
  submitLabel: string;
  secondaryAction?: ReactNode;
}) {
  const label = "mb-1 block text-xs font-medium text-muted";
  const status = item?.status ?? defaultStatus ?? "possédé";
  const wishlist = status !== "possédé";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nom *</label>
          <input
            name="name"
            required
            defaultValue={item?.name ?? ""}
            placeholder="Sony A7 IV, Rode NTG5…"
            className="field"
          />
        </div>
        <div>
          <label className={label}>Catégorie</label>
          <select
            name="category"
            defaultValue={item?.category ?? "Autre"}
            className="field"
          >
            {EQUIPMENT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Statut</label>
          <select name="status" defaultValue={status} className="field">
            <option value="possédé">Possédé</option>
            <option value="à acheter">À acheter</option>
          </select>
        </div>
        <div>
          <label className={label}>
            {wishlist ? "Prix estimé (€)" : "Prix d'achat (€)"}
          </label>
          <input
            type="number"
            name="priceEur"
            min="0"
            step="1"
            defaultValue={item?.priceEur ?? ""}
            className="field"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Référence / n° de série</label>
          <input
            name="reference"
            defaultValue={item?.reference ?? ""}
            className="field"
          />
        </div>
        {wishlist ? (
          <div>
            <label className={label}>Priorité</label>
            <select
              name="priority"
              defaultValue={item?.priority ?? 2}
              className="field"
            >
              <option value={1}>Haute</option>
              <option value={2}>Moyenne</option>
              <option value={3}>Basse</option>
            </select>
          </div>
        ) : (
          <div>
            <label className={label}>État</label>
            <select
              name="condition"
              defaultValue={item?.condition ?? "bon"}
              className="field"
            >
              {EQUIPMENT_CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {wishlist ? (
          <div>
            <label className={label}>Lien produit</label>
            <input
              name="url"
              type="url"
              defaultValue={item?.url ?? ""}
              className="field"
            />
          </div>
        ) : (
          <div>
            <label className={label}>Date d&apos;achat</label>
            <input
              type="date"
              name="purchasedAt"
              defaultValue={toDateInput(item?.purchasedAt ?? null)}
              className="field"
            />
          </div>
        )}
      </div>

      <div>
        <label className={label}>Notes</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={item?.notes ?? ""}
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
