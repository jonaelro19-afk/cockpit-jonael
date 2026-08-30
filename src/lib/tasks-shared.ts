// Config des tâches, SANS accès base de données (importable côté client).

export const TASK_MODULES = ["bts", "sport", "mj", "gmail", "perso"] as const;

export const moduleMeta: Record<string, { label: string; color: string }> = {
  bts: { label: "BTS", color: "#a78bfa" },
  sport: { label: "Sport", color: "#34d399" },
  mj: { label: "M&J", color: "#f472b6" },
  gmail: { label: "Gmail", color: "#fbbf24" },
  perso: { label: "Perso", color: "#38bdf8" },
};
