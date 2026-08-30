import type { SportActivity } from "@/generated/prisma/client";

// Formulaire de séance (création ou édition). Simple <form> serveur.
// `action` est une server action ; pour l'édition on passe l'activité existante.

const TYPES = ["Course", "Vélo", "Muscu", "Autre"];

function toDateInput(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}
function toTimeInput(d: Date) {
  return new Date(d).toISOString().slice(11, 16);
}

export default function ActivityForm({
  action,
  activity,
  submitLabel,
}: {
  action: (fd: FormData) => void | Promise<void>;
  activity?: SportActivity;
  submitLabel: string;
}) {
  const field = "field";
  const label = "mb-1 block text-xs font-medium text-muted";

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className={label}>Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={activity ? toDateInput(activity.date) : ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>Heure</label>
          <input
            type="time"
            name="time"
            defaultValue={activity ? toTimeInput(activity.date) : "12:00"}
            className={field}
          />
        </div>
        <div>
          <label className={label}>Type</label>
          <select name="type" defaultValue={activity?.type ?? "Course"} className={field}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Ressenti (1–5)</label>
          <select name="effort" defaultValue={activity?.effort ?? ""} className={field}>
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Titre (optionnel)</label>
        <input
          type="text"
          name="title"
          defaultValue={activity?.title ?? ""}
          placeholder="Sortie longue, fractionné 8x400m…"
          className={field}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Durée (min)</label>
          <input
            type="number"
            name="durationMin"
            min="0"
            step="1"
            required
            defaultValue={activity ? Math.round(activity.durationSec / 60) : ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>Distance (km)</label>
          <input
            type="number"
            name="distanceKm"
            min="0"
            step="0.01"
            defaultValue={activity?.distanceM ? activity.distanceM / 1000 : ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>Dénivelé + (m)</label>
          <input
            type="number"
            name="elevationM"
            min="0"
            step="1"
            defaultValue={activity?.elevationM ?? ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>FC moyenne</label>
          <input
            type="number"
            name="avgHr"
            min="0"
            defaultValue={activity?.avgHr ?? ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>FC max</label>
          <input
            type="number"
            name="maxHr"
            min="0"
            defaultValue={activity?.maxHr ?? ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>Calories</label>
          <input
            type="number"
            name="calories"
            min="0"
            defaultValue={activity?.calories ?? ""}
            className={field}
          />
        </div>
      </div>

      <div>
        <label className={label}>Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={activity?.notes ?? ""}
          className={field}
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
      >
        {submitLabel}
      </button>
    </form>
  );
}
