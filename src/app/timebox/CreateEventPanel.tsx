"use client";

import { useActionState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { TimeboxCalendar } from "@/lib/types";
import { categoryColor } from "@/lib/timebox-shared";
import { createTimeboxEvent, type CreateEventState } from "./actions";

export type Draft = { date: string; start: string; end: string };

export default function CreateEventPanel({
  open,
  draft,
  calendars,
  onClose,
  onCreated,
}: {
  open: boolean;
  draft: Draft;
  calendars: TimeboxCalendar[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    CreateEventState | null,
    FormData
  >(createTimeboxEvent, null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (state?.ok) {
      onCreated();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-card border border-line bg-surface p-5 sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Nouvelle boîte de temps</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost -mr-2 p-2"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Titre
            </label>
            <input
              ref={titleRef}
              name="title"
              required
              placeholder="Réviser SysML, séance vélo…"
              className="field w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Date
            </label>
            <input
              type="date"
              name="date"
              required
              defaultValue={draft.date}
              className="field w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Début
              </label>
              <input
                type="time"
                name="start"
                required
                defaultValue={draft.start}
                step={300}
                className="field w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Fin
              </label>
              <input
                type="time"
                name="end"
                required
                defaultValue={draft.end}
                step={300}
                className="field w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Calendrier
            </label>
            {calendars.length === 0 ? (
              <p className="rounded-field bg-surface-2 px-3 py-2 text-xs text-muted">
                Aucun calendrier activé. Va dans Paramètres → Calendriers.
              </p>
            ) : (
              <select name="calendarId" required className="field w-full">
                {calendars.map((c) => (
                  <option key={c.googleCalendarId} value={c.googleCalendarId}>
                    {c.label} — {c.category}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Notes <span className="text-faint">(facultatif)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              className="field w-full resize-none"
            />
          </div>

          {state && !state.ok && (
            <p className="rounded-field bg-live/10 px-3 py-2 text-xs text-live">
              {state.error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={pending || calendars.length === 0}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {pending ? "Ajout…" : "Ajouter à l'agenda"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-faint">
          {[...new Set(calendars.map((c) => c.category))].map((cat) => (
            <span key={cat} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: categoryColor(cat) }}
              />
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
