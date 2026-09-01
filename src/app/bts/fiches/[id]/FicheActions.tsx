"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, RefreshCw, Pencil, Trash2 } from "lucide-react";
import {
  toggleFicheBookmark,
  regenerateFiche,
  updateFicheSource,
  deleteFiche,
} from "../../actions";

export default function FicheActions({
  id,
  bookmarked,
  sourceText,
}: {
  id: string;
  bookmarked: boolean;
  sourceText: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(sourceText);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await toggleFicheBookmark(id, !bookmarked);
              router.refresh();
            })
          }
          className={
            bookmarked
              ? "chip border border-amber-400/40 bg-amber-400/15 text-amber-300"
              : "btn-secondary"
          }
        >
          <Bookmark
            size={14}
            className={bookmarked ? "fill-amber-400 text-amber-400" : ""}
          />
          {bookmarked ? "À revoir" : "Marquer à revoir"}
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await regenerateFiche(id);
              router.refresh();
            })
          }
          className="btn-secondary disabled:opacity-60"
        >
          <RefreshCw size={14} className={pending ? "animate-spin" : ""} />
          Régénérer
        </button>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="btn-secondary"
        >
          <Pencil size={14} /> Modifier le cours
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Supprimer cette fiche ?")) return;
            start(() => deleteFiche(id));
          }}
          className="btn-ghost text-live disabled:opacity-60"
        >
          <Trash2 size={14} /> Supprimer
        </button>
      </div>

      {editing && (
        <div className="mt-3 rounded-card border border-line bg-surface p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="field w-full resize-y font-mono text-[13px] leading-relaxed"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await updateFicheSource(id, text);
                  setEditing(false);
                  router.refresh();
                })
              }
              className="btn-primary disabled:opacity-60"
            >
              {pending ? "Régénération…" : "Enregistrer + régénérer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setText(sourceText);
                setEditing(false);
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {pending && !editing && (
        <p className="mt-2 text-xs text-muted">Traitement en cours…</p>
      )}
    </div>
  );
}
