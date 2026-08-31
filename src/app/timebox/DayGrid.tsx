"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TimeBlock } from "@/lib/types";
import { categoryColor, fromMinutes } from "@/lib/timebox-shared";

const PPM = 0.9; // pixels par minute (54 px / heure)
const GUTTER = 48; // largeur de la colonne des heures
const SNAP = 15; // minutes

type Placed = TimeBlock & { col: number; colCount: number };

// Répartit les boîtes qui se chevauchent en colonnes côte à côte.
function place(blocks: TimeBlock[]): Placed[] {
  const sorted = [...blocks].sort(
    (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
  );
  const out: Placed[] = [];
  let cluster: TimeBlock[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const colEnds: number[] = [];
    const cols = new Map<string, number>();
    for (const b of cluster) {
      let c = colEnds.findIndex((end) => b.startMin >= end);
      if (c === -1) {
        c = colEnds.length;
        colEnds.push(b.endMin);
      } else {
        colEnds[c] = b.endMin;
      }
      cols.set(b.id, c);
    }
    for (const b of cluster)
      out.push({ ...b, col: cols.get(b.id) ?? 0, colCount: colEnds.length });
    cluster = [];
    clusterEnd = -1;
  };

  for (const b of sorted) {
    if (cluster.length && b.startMin >= clusterEnd) flush();
    cluster.push(b);
    clusterEnd = Math.max(clusterEnd, b.endMin);
  }
  if (cluster.length) flush();
  return out;
}

export default function DayGrid({
  blocks,
  isToday,
  onSlotClick,
}: {
  blocks: TimeBlock[];
  isToday: boolean;
  onSlotClick: (startMin: number) => void;
}) {
  const [nowMin, setNowMin] = useState<number | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isToday) return;
    const tick = () => {
      const d = new Date();
      const p = new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Paris",
      }).format(d);
      const [h, m] = p.split(":").map(Number);
      setNowMin(h * 60 + m);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  const { winStart, winEnd, placed } = useMemo(() => {
    let lo = 7 * 60;
    let hi = 22 * 60;
    for (const b of blocks) {
      lo = Math.min(lo, b.startMin);
      hi = Math.max(hi, b.endMin);
    }
    if (isToday && nowMin != null) {
      lo = Math.min(lo, nowMin);
      hi = Math.max(hi, nowMin + 30);
    }
    lo = Math.max(0, Math.floor(lo / 60) * 60);
    hi = Math.min(24 * 60, Math.ceil(hi / 60) * 60);
    return { winStart: lo, winEnd: hi, placed: place(blocks) };
  }, [blocks, isToday, nowMin]);

  const height = (winEnd - winStart) * PPM;
  const hours: number[] = [];
  for (let h = winStart; h <= winEnd; h += 60) hours.push(h);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = e.clientY - rect.top;
    const raw = winStart + y / PPM;
    const snapped = Math.round(raw / SNAP) * SNAP;
    onSlotClick(Math.max(winStart, Math.min(winEnd - 60, snapped)));
  };

  return (
    <div className="flex">
      {/* Colonne des heures */}
      <div className="shrink-0" style={{ width: GUTTER }}>
        {hours.map((h) => (
          <div
            key={h}
            className="relative text-right text-[10px] tabular-nums text-faint"
            style={{ height: h === winEnd ? 0 : 60 * PPM }}
          >
            <span className="absolute -top-1.5 right-2">{fromMinutes(h)}</span>
          </div>
        ))}
      </div>

      {/* Zone des boîtes */}
      <div
        ref={areaRef}
        onClick={handleClick}
        className="relative flex-1 cursor-copy"
        style={{ height }}
        title="Clique pour ajouter une boîte de temps"
      >
        {/* Lignes horaires */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute inset-x-0 border-t border-line"
            style={{ top: (h - winStart) * PPM }}
          />
        ))}

        {/* Trait "maintenant" */}
        {isToday && nowMin != null && nowMin >= winStart && nowMin <= winEnd && (
          <div
            className="absolute inset-x-0 z-20 flex items-center"
            style={{ top: (nowMin - winStart) * PPM }}
          >
            <div className="h-2 w-2 -ml-1 rounded-full bg-live" />
            <div className="h-px flex-1 bg-live" />
          </div>
        )}

        {/* Boîtes */}
        {placed.map((b) => {
          const color = categoryColor(b.category);
          const top = (b.startMin - winStart) * PPM;
          const h = Math.max(18, (b.endMin - b.startMin) * PPM - 2);
          const current =
            isToday &&
            nowMin != null &&
            b.startMin <= nowMin &&
            b.endMin >= nowMin;
          const compact = h < 34;
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
              className="absolute z-10 block overflow-hidden rounded-lg px-2 py-1 text-[#0a0a0a] no-underline transition-transform hover:z-30 hover:scale-[1.01]"
              style={{
                top,
                height: h,
                left: `calc(${(b.col / b.colCount) * 100}% + 2px)`,
                width: `calc(${100 / b.colCount}% - 4px)`,
                background: color,
                boxShadow: current
                  ? "0 0 0 2px #fff, 0 4px 12px rgba(0,0,0,0.35)"
                  : "0 1px 3px rgba(0,0,0,0.3)",
              }}
              title={`${b.start}–${b.end} · ${b.title} · ${b.source}`}
            >
              <p className="truncate text-xs font-semibold leading-tight">
                {b.title}
              </p>
              {!compact && (
                <p className="truncate text-[10px] font-medium leading-tight opacity-80">
                  {b.start}–{b.end}
                  {b.source ? ` · ${b.source}` : ""}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
