"use client";

import { useTransition } from "react";
import { fmtDateFR } from "./engine";
import type { AgentOutput } from "./engine/types";
import { setAnalysisStatus, toggleChecklistItem } from "./actions";

const STEPS = [
  { key: "brief", label: "Brief" },
  { key: "devis", label: "Devis" },
  { key: "tournage", label: "Tournage" },
  { key: "montage", label: "Montage" },
  { key: "livraison", label: "Livraison" },
];

type PlanningFacts = {
  shootDate?: string | null;
  roughCutDue?: string | null;
  colorDue?: string | null;
  finalDue?: string | null;
  checklist?: { label: string; done: boolean }[];
};

export default function AnalysisTracker({
  analysisId,
  status,
  outputs,
  onChange,
}: {
  analysisId: string;
  status: string;
  outputs: Record<string, AgentOutput>;
  onChange: () => void;
}) {
  const [pending, start] = useTransition();
  const planning = (outputs.planning?.facts ?? {}) as PlanningFacts;
  const commercial = outputs.commercial?.facts as { amountEUR?: number } | undefined;
  const currentIdx = STEPS.findIndex((s) => s.key === status);

  const setStatus = (key: string) =>
    start(async () => {
      await setAnalysisStatus(analysisId, key);
      onChange();
    });

  const toggle = (i: number) =>
    start(async () => {
      await toggleChecklistItem(analysisId, i);
      onChange();
    });

  const assignments = [
    {
      who: "Jonael",
      task: "Qualification commerciale + envoi devis",
      when: commercial?.amountEUR ? `${commercial.amountEUR} €` : "—",
    },
    {
      who: "Malo",
      task: "Repérage site + checklist tournage",
      when: planning.shootDate ? `avant ${fmtDateFR(planning.shootDate)}` : "à planifier",
    },
    { who: "Monteur", task: "Rough cut", when: fmtDateFR(planning.roughCutDue ?? null) },
    { who: "Monteur", task: "Étalonnage", when: fmtDateFR(planning.colorDue ?? null) },
  ];

  const deliverables = [
    { label: "Devis signé", due: null as string | null, done: currentIdx >= 2 },
    { label: "Rough cut", due: planning.roughCutDue ?? null, done: currentIdx >= 3 },
    { label: "Master final", due: planning.finalDue ?? null, done: currentIdx >= 4 },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            disabled={pending}
            onClick={() => setStatus(s.key)}
            className={`rounded-field px-3 py-1.5 text-xs font-medium transition-colors ${
              i < currentIdx
                ? "bg-[#34C759]/15 text-[#5DD97E]"
                : i === currentIdx
                  ? "bg-white text-black"
                  : "bg-surface-2 text-muted hover:text-text"
            }`}
          >
            {i < currentIdx ? "✓ " : ""}
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 text-sm md:grid-cols-3">
        <div>
          <h3 className="mb-1 text-xs text-muted">Assignations</h3>
          <ul className="space-y-1">
            {assignments.map((a, i) => (
              <li key={i} className="text-xs">
                <span style={{ color: "#f97316" }}>{a.who}</span> — {a.task}
                <span className="text-muted"> · {a.when}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-1 text-xs text-muted">Livrables</h3>
          <ul className="space-y-1">
            {deliverables.map((d, i) => (
              <li key={i} className="text-xs">
                {d.done ? "✅" : "⏳"} {d.label}
                {d.due && <span className="text-muted"> · {fmtDateFR(d.due)}</span>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-1 text-xs text-muted">Checklist pré-tournage</h3>
          <ul className="max-h-44 space-y-1 overflow-auto pr-1">
            {(planning.checklist ?? []).map((c, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={!!c.done}
                    disabled={pending}
                    onChange={() => toggle(i)}
                    className="mt-0.5"
                  />
                  <span className={c.done ? "text-muted line-through" : ""}>
                    {c.label}
                  </span>
                </label>
              </li>
            ))}
            {!planning.checklist?.length && (
              <li className="text-xs text-muted">
                Lance une analyse pour générer la checklist.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
