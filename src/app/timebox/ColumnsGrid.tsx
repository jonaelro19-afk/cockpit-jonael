"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TimeBlock } from "@/lib/types";
import {
  categoryColor,
  fromMinutes,
  hourWindow,
  placeBlocks,
  nowMinutesParis,
  PX_PER_MIN,
  HOUR_GUTTER,
  SNAP_MIN,
} from "@/lib/timebox-shared";

export type GridColumn = {
  key: string;
  date: string; // "AAAA-MM-JJ"
  label: string; // ex. "Lun"
  sublabel?: string; // ex. "31"
  isToday?: boolean;
};

export default function ColumnsGrid({
  columns,
  blocks,
  onSlotClick,
}: {
  columns: GridColumn[];
  blocks: TimeBlock[];
  onSlotClick: (date: string, startMin: number) => void;
}) {
  const [nowMin, setNowMin] = useState<number | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const anyToday = columns.some((c) => c.isToday);

  useEffect(() => {
    if (!anyToday) return;
    const tick = () => setNowMin(nowMinutesParis());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [anyToday]);

  const { winStart, winEnd } = useMemo(
    () => hourWindow(blocks, anyToday ? nowMin : null),
    [blocks, anyToday, nowMin],
  );

  const placedByCol = useMemo(() => {
    const map = new Map<string, ReturnType<typeof placeBlocks>>();
    for (const c of columns)
      map.set(
        c.key,
        placeBlocks(blocks.filter((b) => b.date === c.date && !b.allDay)),
      );
    return map;
  }, [columns, blocks]);

  const height = (winEnd - winStart) * PX_PER_MIN;
  const hours: number[] = [];
  for (let h = winStart; h <= winEnd; h += 60) hours.push(h);

  const clickToSlot =
    (date: string) => (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const raw = winStart + y / PX_PER_MIN;
      const snapped = Math.round(raw / SNAP_MIN) * SNAP_MIN;
      onSlotClick(date, Math.max(winStart, Math.min(winEnd - 60, snapped)));
    };

  const single = columns.length === 1;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: single ? undefined : columns.length * 90 + HOUR_GUTTER }}>
        {/* En-tête des colonnes */}
        {!single && (
          <div className="flex" style={{ paddingLeft: HOUR_GUTTER }}>
            {columns.map((c) => (
              <div
                key={c.key}
                className={`flex-1 border-b border-line pb-1 text-center text-xs ${
                  c.isToday ? "font-semibold text-text" : "text-muted"
                }`}
              >
                {c.label}{" "}
                <span
                  className={
                    c.isToday
                      ? "ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-live text-[11px] text-white"
                      : ""
                  }
                >
                  {c.sublabel}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex">
          {/* Colonne des heures */}
          <div className="shrink-0" style={{ width: HOUR_GUTTER }}>
            {hours.map((h) => (
              <div
                key={h}
                className="relative text-right text-[10px] tabular-nums text-faint"
                style={{ height: h === winEnd ? 0 : 60 * PX_PER_MIN }}
              >
                <span className="absolute -top-1.5 right-2">
                  {fromMinutes(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Colonnes des jours */}
          <div ref={areaRef} className="relative flex flex-1" style={{ height }}>
            {/* Lignes horaires (fond) */}
            {hours.map((h) => (
              <div
                key={h}
                className="pointer-events-none absolute inset-x-0 border-t border-line"
                style={{ top: (h - winStart) * PX_PER_MIN }}
              />
            ))}

            {columns.map((c, i) => {
              const placed = placedByCol.get(c.key) ?? [];
              return (
                <div
                  key={c.key}
                  onClick={clickToSlot(c.date)}
                  className={`relative flex-1 cursor-copy ${
                    i > 0 ? "border-l border-line" : ""
                  } ${c.isToday && !single ? "bg-white/[0.02]" : ""}`}
                  title="Clique pour ajouter une boîte"
                >
                  {/* Trait "maintenant" */}
                  {c.isToday &&
                    nowMin != null &&
                    nowMin >= winStart &&
                    nowMin <= winEnd && (
                      <div
                        className="absolute inset-x-0 z-20 flex items-center"
                        style={{ top: (nowMin - winStart) * PX_PER_MIN }}
                      >
                        <div className="-ml-1 h-2 w-2 rounded-full bg-live" />
                        <div className="h-px flex-1 bg-live" />
                      </div>
                    )}

                  {placed.map((b) => {
                    const color = categoryColor(b.category);
                    const top = (b.startMin - winStart) * PX_PER_MIN;
                    const h = Math.max(
                      16,
                      (b.endMin - b.startMin) * PX_PER_MIN - 2,
                    );
                    const current =
                      c.isToday &&
                      nowMin != null &&
                      b.startMin <= nowMin &&
                      b.endMin >= nowMin;
                    const compact = h < 32;
                    return (
                      <a
                        key={b.id}
                        href={b.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!b.htmlLink) e.preventDefault();
                        }}
                        className="absolute z-10 block overflow-hidden rounded-lg px-1.5 py-1 text-[#0a0a0a] no-underline transition-transform hover:z-30 hover:scale-[1.01]"
                        style={{
                          top,
                          height: h,
                          left: `calc(${(b.col / b.colCount) * 100}% + 2px)`,
                          width: `calc(${100 / b.colCount}% - 4px)`,
                          background: color,
                          boxShadow: current
                            ? "0 0 0 2px #fff, 0 4px 12px rgba(0,0,0,.35)"
                            : "0 1px 3px rgba(0,0,0,.3)",
                        }}
                        title={`${b.start}–${b.end} · ${b.title} · ${b.source}`}
                      >
                        <p className="truncate text-[11px] font-semibold leading-tight">
                          {b.title}
                        </p>
                        {!compact && (
                          <p className="truncate text-[10px] font-medium leading-tight opacity-80">
                            {b.start}–{b.end}
                            {single && b.source ? ` · ${b.source}` : ""}
                          </p>
                        )}
                      </a>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
