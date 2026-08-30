"use client";

import { useState, useTransition } from "react";
import { Target, Check, X, Pencil } from "lucide-react";
import { saveSportGoal } from "./actions";
import { fmtDuration } from "@/lib/sport-shared";
import type { SportGoal } from "@/lib/sport";

function Bar({
  label,
  value,
  target,
  display,
}: {
  label: string;
  value: number;
  target: number;
  display: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const done = value >= target && target > 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className={done ? "font-semibold text-online" : "text-text"}>
          {display}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-pill bg-surface-2">
        <div
          className="h-full rounded-pill transition-all"
          style={{
            width: `${pct}%`,
            background: done ? "#34c759" : "#34d399",
          }}
        />
      </div>
    </div>
  );
}

export default function GoalCard({
  goal,
  progress,
}: {
  goal: SportGoal;
  progress: { minutes: number; km: number; sessions: number };
}) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  return (
    <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          <Target size={13} /> Objectif de la semaine
        </h2>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="text-muted hover:text-text"
          aria-label="Modifier l'objectif"
        >
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <form
          action={(fd) =>
            start(async () => {
              await saveSportGoal(fd);
              setEditing(false);
            })
          }
          className="grid grid-cols-3 gap-3"
        >
          <label className="text-xs text-muted">
            Minutes
            <input
              type="number"
              name="minutes"
              min="0"
              defaultValue={goal.minutes}
              className="field mt-1"
            />
          </label>
          <label className="text-xs text-muted">
            Km
            <input
              type="number"
              name="km"
              min="0"
              defaultValue={goal.km}
              className="field mt-1"
            />
          </label>
          <label className="text-xs text-muted">
            Séances
            <input
              type="number"
              name="sessions"
              min="0"
              defaultValue={goal.sessions}
              className="field mt-1"
            />
          </label>
          <div className="col-span-3 flex gap-2">
            <button type="submit" disabled={pending} className="btn-primary">
              <Check size={15} /> Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-ghost"
            >
              <X size={15} />
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <Bar
            label="Temps"
            value={progress.minutes}
            target={goal.minutes}
            display={`${fmtDuration(progress.minutes * 60)} / ${fmtDuration(goal.minutes * 60)}`}
          />
          <Bar
            label="Distance"
            value={progress.km}
            target={goal.km}
            display={`${progress.km.toFixed(1)} / ${goal.km} km`}
          />
          <Bar
            label="Séances"
            value={progress.sessions}
            target={goal.sessions}
            display={`${progress.sessions} / ${goal.sessions}`}
          />
        </div>
      )}
    </section>
  );
}
