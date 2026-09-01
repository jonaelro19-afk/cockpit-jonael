"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";
import { createFiche, type FicheFormState } from "../../actions";
import { FICHE_KINDS } from "@/lib/bts-shared";

type Subject = { id: string; name: string; color: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full disabled:opacity-60"
    >
      <Sparkles size={15} />
      {pending ? "Génération de la fiche… (≈ 15 s)" : "Générer la fiche"}
    </button>
  );
}

export default function NewFicheForm({ subjects }: { subjects: Subject[] }) {
  const [state, formAction] = useActionState<FicheFormState, FormData>(
    createFiche,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          Titre de la fiche
        </label>
        <input
          name="title"
          required
          placeholder="Ex : Les capteurs — TOR & analogiques"
          className="field w-full"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Matière <span className="text-faint">(facultatif)</span>
          </label>
          <select name="subjectId" className="field w-full" defaultValue="">
            <option value="">— aucune —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Type de fiche
          </label>
          <select name="kind" className="field w-full" defaultValue="Synthèse">
            {FICHE_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          Ton cours <span className="text-faint">(colle le texte tel quel)</span>
        </label>
        <textarea
          name="sourceText"
          required
          rows={14}
          placeholder="Colle ici le cours à réviser : tes notes, le poly du prof, un chapitre entier…"
          className="field w-full resize-y font-mono text-[13px] leading-relaxed"
        />
        <p className="mt-1 text-[11px] text-faint">
          L&apos;IA garde seulement l&apos;essentiel et le met en forme façon fiche
          papier (titres colorés, mots-clés, encadrés « à retenir »).
        </p>
      </div>

      {state?.error && (
        <p className="rounded-field bg-live/10 px-3 py-2 text-xs text-live">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
