// Config + formatage du module Sport, SANS accès base de données.
// Importable côté client comme côté serveur.

export const SPORT_TYPES = ["Course", "Vélo", "Muscu", "Autre"] as const;

export const sportColor: Record<string, string> = {
  Course: "#34d399",
  Vélo: "#38bdf8",
  Muscu: "#fbbf24",
  Autre: "#9a9a9e",
};

export type WeekStats = {
  count: number;
  durationSec: number;
  distanceM: number;
  elevationM: number;
  byType: Record<string, number>;
};

export function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}

export function fmtDistance(m: number | null): string {
  if (!m) return "—";
  return `${(m / 1000).toFixed(m >= 10000 ? 0 : 1)} km`;
}

export function fmtPace(durationSec: number, distanceM: number | null): string {
  if (!distanceM || distanceM < 100) return "—";
  const secPerKm = durationSec / (distanceM / 1000);
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}
