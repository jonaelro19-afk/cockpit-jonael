// Constantes & helpers Timebox sans dépendance à la base — importables côté client.

import type { BlockCategory, TimeBlock } from "@/lib/types";

export const CATEGORY_COLOR: Record<BlockCategory, string> = {
  BTS: "#a78bfa",
  Sport: "#34d399",
  "M&J": "#f472b6",
  Perso: "#38bdf8",
  Pause: "#9a9a9e",
  Cours: "#fbbf24",
};

export function categoryColor(cat: string): string {
  return CATEGORY_COLOR[cat as BlockCategory] ?? "#9a9a9e";
}

export const VIEWS = ["jour", "semaine", "mois", "annee"] as const;
export type TimeboxView = (typeof VIEWS)[number];

export function parseView(v: string | undefined): TimeboxView {
  return (VIEWS as readonly string[]).includes(v ?? "")
    ? (v as TimeboxView)
    : "jour";
}

export const PX_PER_MIN = 0.9; // hauteur de la grille : 54 px / heure
export const HOUR_GUTTER = 48; // largeur de la colonne des heures
export const SNAP_MIN = 15;

// "HH:MM" → minutes depuis minuit.
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// minutes depuis minuit → "HH:MM"
export function fromMinutes(min: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(min)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type PlacedBlock = TimeBlock & { col: number; colCount: number };

// Répartit les boîtes qui se chevauchent en colonnes côte à côte (par jour).
export function placeBlocks(blocks: TimeBlock[]): PlacedBlock[] {
  const sorted = [...blocks].sort(
    (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
  );
  const out: PlacedBlock[] = [];
  let cluster: TimeBlock[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const colEnds: number[] = [];
    const colOf = new Map<string, number>();
    for (const b of cluster) {
      let c = colEnds.findIndex((end) => b.startMin >= end);
      if (c === -1) {
        c = colEnds.length;
        colEnds.push(b.endMin);
      } else {
        colEnds[c] = b.endMin;
      }
      colOf.set(b.id, c);
    }
    for (const b of cluster)
      out.push({ ...b, col: colOf.get(b.id) ?? 0, colCount: colEnds.length });
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

// Fenêtre horaire [début, fin] en minutes qui englobe tous les blocs
// (par défaut 7 h → 22 h), arrondie à l'heure.
export function hourWindow(
  blocks: TimeBlock[],
  extra?: number | null,
): { winStart: number; winEnd: number } {
  let lo = 7 * 60;
  let hi = 22 * 60;
  for (const b of blocks) {
    lo = Math.min(lo, b.startMin);
    hi = Math.max(hi, b.endMin);
  }
  if (extra != null) {
    lo = Math.min(lo, extra);
    hi = Math.max(hi, extra + 30);
  }
  return {
    winStart: Math.max(0, Math.floor(lo / 60) * 60),
    winEnd: Math.min(24 * 60, Math.ceil(hi / 60) * 60),
  };
}

// Minute "maintenant" (Paris) ou null.
export function nowMinutesParis(): number {
  const p = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Paris",
  }).format(new Date());
  const [h, m] = p.split(":").map(Number);
  return h * 60 + m;
}
