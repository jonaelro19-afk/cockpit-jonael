"use client";

import { useState } from "react";
import {
  Handshake,
  CalendarClock,
  Clapperboard,
  Film,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import type { AgentDef, AgentOutput } from "./engine/types";

const ICONS: Record<string, LucideIcon> = {
  Handshake,
  CalendarClock,
  Clapperboard,
  Film,
  Megaphone,
};

export default function AgentCard({
  agent,
  output,
}: {
  agent: AgentDef;
  output?: AgentOutput;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const Icon = ICONS[agent.icon] ?? Handshake;

  const badge = !output
    ? null
    : output.degraded
      ? { label: "dégradé", cls: "bg-amber-400/15 text-amber-300" }
      : output.engine === "llm"
        ? {
            label: output.patched ? "IA · patché" : "IA",
            cls: "bg-[#34C759]/15 text-[#5DD97E]",
          }
        : {
            label: output.patched ? "règles · patché" : "règles",
            cls: "bg-white/[0.08] text-muted",
          };

  return (
    <div
      className="flex flex-col rounded-card border border-line bg-surface p-4"
      style={{ borderTopColor: agent.accent, borderTopWidth: 2 }}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: agent.accent }} />
        <span className="text-sm font-semibold text-text">{agent.label}</span>
        {badge && (
          <span
            className={`ml-auto rounded-pill px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      <p className="mt-2 min-h-[2.5rem] text-xs text-text">
        {output?.summary ?? "En attente d'analyse…"}
      </p>
      {output?.degradedReason && (
        <p className="mt-1 text-[10px] text-amber-300">↳ {output.degradedReason}</p>
      )}

      {output?.sections?.length ? (
        <div className="mt-2 space-y-1 border-t border-line pt-2">
          {output.sections.map((s, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between text-left text-xs font-medium text-muted hover:text-text"
              >
                <span>{s.title}</span>
                <span>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <pre className="mb-2 mt-1 whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-text/90">
                  {s.body}
                </pre>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
