"use client";

import { useTransition } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { AGENT_MAP } from "./engine";
import type { AgentId, Conflict } from "./engine/types";
import { resolveConflictAction } from "./actions";

export default function ConflictList({
  analysisId,
  conflicts,
  onChange,
}: {
  analysisId: string;
  conflicts: Conflict[];
  onChange: () => void;
}) {
  const [pending, start] = useTransition();

  if (!conflicts.length) {
    return (
      <p className="text-xs text-muted">
        Aucun conflit détecté entre les agents. ✓
      </p>
    );
  }

  const resolve = (c: Conflict, choice: "apply" | "keep") =>
    start(async () => {
      await resolveConflictAction(analysisId, c.id, choice);
      onChange();
    });

  const open = conflicts.filter((c) => !c.resolved).length;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-xs text-muted">
        <AlertTriangle size={13} className="text-amber-300" />
        {open} conflit{open > 1 ? "s" : ""} à trancher · {conflicts.length} détecté
        {conflicts.length > 1 ? "s" : ""}
      </p>
      {conflicts.map((c) => {
        const nameA = AGENT_MAP[c.between[0] as AgentId]?.label ?? c.between[0];
        const nameB = AGENT_MAP[c.between[1] as AgentId]?.label ?? c.between[1];
        return (
          <div
            key={c.id}
            className={`rounded-field border p-3 text-sm ${
              c.resolved
                ? "border-line opacity-60"
                : "border-amber-400/40 bg-amber-400/[0.04]"
            }`}
          >
            <div className="mb-1 flex items-center gap-2 text-xs text-muted">
              <span className="font-mono">{c.id}</span>
              <span>
                {nameA} ↔ {nameB}
              </span>
              <span className="ml-auto">{c.field}</span>
            </div>
            <p className="text-text">{c.message}</p>
            {c.suggestion && (
              <p className="mt-1 text-xs text-muted">Suggestion : {c.suggestion}</p>
            )}

            {c.resolved ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-[#5DD97E]">
                <Check size={12} />
                {c.resolved.choice === "apply"
                  ? "suggestion appliquée"
                  : c.resolved.choice === "keep"
                    ? "gardé tel quel"
                    : "résolu automatiquement"}
              </p>
            ) : (
              <div className="mt-2 flex gap-2">
                {c.patch && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => resolve(c, "apply")}
                    className="btn-primary px-3 py-1 text-xs"
                  >
                    Appliquer la suggestion
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => resolve(c, "keep")}
                  className="btn-secondary px-3 py-1 text-xs"
                >
                  Garder tel quel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
