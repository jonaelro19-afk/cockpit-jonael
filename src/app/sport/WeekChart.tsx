"use client";
// Graphique de la semaine : minutes par jour, empilées par type de sport.

import { useState } from "react";
import { sportColor, fmtDuration } from "@/lib/sport-shared";

export type DayBucket = {
  label: string;
  iso: string;
  totalMin: number;
  segments: { type: string; minutes: number }[];
};

const CHART_H = 132;
const GAP = 2;

export default function WeekChart({ days }: { days: DayBucket[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(60, ...days.map((d) => d.totalMin));
  const todayIso = new Date().toISOString().slice(0, 10);

  const typesPresent = Array.from(
    new Set(days.flatMap((d) => d.segments.map((s) => s.type))),
  );

  if (days.every((d) => d.totalMin === 0)) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        Aucune séance cette semaine.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: CHART_H + 24 }}>
        {days.map((d) => {
          const isToday = d.iso === todayIso;
          return (
            <div
              key={d.iso}
              className="flex flex-1 flex-col items-center"
              onMouseEnter={() => setHover(d.iso)}
              onMouseLeave={() => setHover(null)}
            >
              <span
                className={`mb-1 text-[10px] tabular-nums transition-opacity ${
                  hover === d.iso || isToday ? "text-text" : "text-muted opacity-0"
                }`}
              >
                {d.totalMin > 0 ? fmtDuration(d.totalMin * 60) : ""}
              </span>
              <div
                className="relative flex w-full max-w-[38px] flex-col-reverse overflow-hidden rounded-md"
                style={{ height: CHART_H }}
              >
                <div className="absolute inset-x-0 bottom-0 h-px bg-line" />
                {d.segments.map((s) => (
                  <div
                    key={s.type}
                    style={{
                      height: `${(s.minutes / max) * CHART_H - GAP}px`,
                      background: sportColor[s.type] ?? "#9a9a9e",
                      marginTop: GAP,
                    }}
                    className="w-full first:mt-0"
                    title={`${s.type} — ${fmtDuration(s.minutes * 60)}`}
                  />
                ))}
              </div>
              <span
                className={`mt-1.5 text-xs ${
                  isToday ? "font-bold text-text" : "text-muted"
                }`}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      {typesPresent.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {typesPresent.map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: sportColor[t] ?? "#9a9a9e" }}
              />
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
