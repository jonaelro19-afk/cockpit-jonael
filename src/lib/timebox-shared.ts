// Constantes Timebox sans dépendance à la base — importables côté client.

import type { BlockCategory } from "@/lib/types";

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
