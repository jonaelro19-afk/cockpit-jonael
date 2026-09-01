"use client";

import { useState, useTransition } from "react";
import { Pin, Pencil, Trash2, ChevronDown } from "lucide-react";
import { MJ_NOTE_THEMES } from "@/lib/mj-shared";
import { updateNote, togglePin, deleteNote } from "./actions";

type Note = {
  id: string;
  theme: string;
  title: string;
  body: string;
  pinned: boolean;
};

export default function MemoNote({
  note,
  html,
}: {
  note: Note;
  html: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <li className="rounded-card border border-line bg-surface p-4">
        <form
          action={(fd) =>
            start(async () => {
              await updateNote(note.id, fd);
              setEditing(false);
            })
          }
          className="space-y-3"
        >
          <input
            name="title"
            defaultValue={note.title}
            required
            className="field w-full font-semibold"
          />
          <select
            name="theme"
            defaultValue={note.theme}
            className="field w-full text-sm"
          >
            {MJ_NOTE_THEMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <textarea
            name="body"
            defaultValue={note.body}
            rows={12}
            className="field w-full resize-y font-mono text-[13px] leading-relaxed"
          />
          <p className="text-[11px] text-faint">
            Markdown léger : <code>## Titre</code>, <code>**gras**</code>,{" "}
            <code>- puce</code>, <code>[texte](lien)</code>.
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="btn-primary disabled:opacity-60"
            >
              {pending ? "…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-card border border-line bg-surface">
      <div className="flex items-start gap-2 p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            size={15}
            className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
          <span className="truncate text-sm font-semibold">{note.title}</span>
          {note.pinned && (
            <Pin size={12} className="shrink-0 fill-amber-400 text-amber-400" />
          )}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title={note.pinned ? "Désépingler" : "Épingler"}
            onClick={() => start(() => togglePin(note.id, !note.pinned))}
            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          >
            <Pin size={13} />
          </button>
          <button
            type="button"
            title="Modifier"
            onClick={() => {
              setEditing(true);
              setOpen(true);
            }}
            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            title="Supprimer"
            onClick={() => {
              if (confirm("Supprimer cette note ?"))
                start(() => deleteNote(note.id));
            }}
            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-live"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="memo-body border-t border-line px-4 py-3 text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </li>
  );
}
