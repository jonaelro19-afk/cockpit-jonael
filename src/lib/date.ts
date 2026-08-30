// Aides pour manipuler les dates dans le fuseau Europe/Paris.

export const PARIS = "Europe/Paris";

// Date du jour à Paris, au format "AAAA-MM-JJ".
export function todayInParis(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PARIS }).format(new Date());
}

// Décale une date "AAAA-MM-JJ" de `days` jours (retourne le même format).
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(d);
}

// Intervalle [00:00, 24:00[ d'une journée parisienne, en instants ISO (UTC).
// Gère automatiquement l'heure d'été / d'hiver.
export function parisDayRange(dateStr: string): { timeMin: string; timeMax: string } {
  const utcMidnight = new Date(`${dateStr}T00:00:00Z`);
  const asParis = new Date(
    utcMidnight.toLocaleString("en-US", { timeZone: PARIS }),
  );
  const offset = utcMidnight.getTime() - asParis.getTime();
  const start = new Date(utcMidnight.getTime() + offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

// Lundi de la semaine contenant `dateStr` (format "AAAA-MM-JJ").
export function mondayOf(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const dow = d.getUTCDay(); // 0 = dimanche
  const delta = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + delta);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(d);
}

// Intervalle [lundi 00:00, lundi suivant 00:00[ en instants ISO (UTC),
// aligné sur le fuseau Europe/Paris.
export function parisWeekRange(dateStr: string): {
  monday: string;
  start: string;
  end: string;
} {
  const monday = mondayOf(dateStr);
  const { timeMin } = parisDayRange(monday);
  const start = new Date(timeMin);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { monday, start: start.toISOString(), end: end.toISOString() };
}

// "sem. du 25 août" (à partir d'un lundi "AAAA-MM-JJ")
export function formatWeekLabel(monday: string): string {
  const d = new Date(`${monday}T12:00:00Z`);
  return `sem. du ${d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  })}`;
}

// "samedi 30 août 2026"
export function formatLongDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
