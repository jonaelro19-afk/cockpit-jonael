"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSubject } from "../../actions";

const COLORS = [
  "#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f472b6", "#f87171", "#818cf8",
];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "Création…" : "Créer la matière"}
    </button>
  );
}

export default function NewSubjectForm() {
  const [state, formAction] = useActionState<{ error: string } | null, FormData>(
    createSubject,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Code</label>
          <input
            name="id"
            required
            placeholder="MECA"
            maxLength={8}
            className="field w-full uppercase"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Nom</label>
          <input
            name="name"
            required
            placeholder="Mécanique"
            className="field w-full"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Couleur</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={c}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <span
                className="block h-8 w-8 rounded-full ring-2 ring-transparent peer-checked:ring-white"
                style={{ background: c }}
              />
            </label>
          ))}
        </div>
      </div>

      {state?.error && (
        <p className="rounded-field bg-live/10 px-3 py-2 text-xs text-live">
          {state.error}
        </p>
      )}

      <Submit />
    </form>
  );
}
