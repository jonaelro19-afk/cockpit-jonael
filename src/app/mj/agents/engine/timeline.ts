// Calculs de dates en jours ouvrés (lun–ven). Déterministe : pas de Date.now().

function parseISO(d: string | null): Date | null {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toISO(dt: Date): string {
  return dt.toISOString().slice(0, 10);
}

export function addBusinessDays(dateISO: string | null, n: number): string | null {
  const dt = parseISO(dateISO);
  if (!dt) return null;
  let added = 0;
  const step = n >= 0 ? 1 : -1;
  while (added < Math.abs(n)) {
    dt.setDate(dt.getDate() + step);
    const day = dt.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return toISO(dt);
}

// Standards M&J : rough +2 j, color +2 j, sound +1 j, R1 +2 j, R2 +1 j, master +1 j
export const ETAPES_POST = [
  { key: "roughCut", label: "Rough cut", days: 2, owner: "Monteur" },
  { key: "color", label: "Étalonnage", days: 2, owner: "Monteur" },
  { key: "sound", label: "Sound design", days: 1, owner: "Monteur" },
  { key: "r1", label: "Révisions R1", days: 2, owner: "Client + Jonael" },
  { key: "r2", label: "Révisions R2", days: 1, owner: "Client + Jonael" },
  { key: "master", label: "Master + exports", days: 1, owner: "Monteur" },
] as const;

export type Milestone = { key: string; label: string; date: string; owner: string };

export type Timeline = {
  shootDate: string | null;
  milestones: Milestone[];
  turnaroundDays: number;
  roughCutDue: string | null;
  colorDue: string | null;
  finalDue: string | null;
};

export function buildTimeline(opts: {
  shootDate: string | null;
  revisionRounds?: number;
}): Timeline {
  const revisionRounds = opts.revisionRounds ?? 2;
  const turnaroundDays = ETAPES_POST.filter((e) =>
    e.key === "r2" ? revisionRounds >= 2 : true,
  ).reduce((s, e) => s + e.days, 0);

  if (!opts.shootDate) {
    return {
      shootDate: null,
      milestones: [],
      turnaroundDays,
      roughCutDue: null,
      colorDue: null,
      finalDue: null,
    };
  }

  let cursor = opts.shootDate;
  const milestones: Milestone[] = [
    { key: "shoot", label: "Tournage", date: opts.shootDate, owner: "Malo + équipe" },
  ];
  for (const e of ETAPES_POST) {
    if (e.key === "r2" && revisionRounds < 2) continue;
    cursor = addBusinessDays(cursor, e.days)!;
    milestones.push({ key: e.key, label: e.label, date: cursor, owner: e.owner });
  }

  return {
    shootDate: opts.shootDate,
    milestones,
    turnaroundDays,
    roughCutDue: milestones.find((m) => m.key === "roughCut")?.date ?? null,
    colorDue: milestones.find((m) => m.key === "color")?.date ?? null,
    finalDue: milestones.at(-1)?.date ?? null,
  };
}

export function fmtDateFR(iso: string | null): string {
  const dt = parseISO(iso);
  if (!dt) return "—";
  return dt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
