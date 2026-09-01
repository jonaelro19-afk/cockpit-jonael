"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { MJ_NOTE_THEMES } from "@/lib/mj-shared";
import { createNote } from "./actions";

export default function AddNote() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        <Plus size={15} /> Nouvelle note
      </button>
    );

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <form
        action={(fd) =>
          start(async () => {
            await createNote(fd);
            setOpen(false);
          })
        }
        className="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
          <input
            name="title"
            required
            placeholder="Titre de la note"
            className="field w-full font-semibold"
          />
          <select name="theme" defaultValue="Ressources" className="field w-full text-sm">
            {MJ_NOTE_THEMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <textarea
          name="body"
          rows={8}
          placeholder="Contenu (markdown léger : ## titre, **gras**, - puce, [texte](lien))"
          className="field w-full resize-y font-mono text-[13px] leading-relaxed"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="btn-primary disabled:opacity-60"
          >
            {pending ? "…" : "Ajouter"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-secondary"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
