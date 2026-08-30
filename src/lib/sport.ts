// Accès aux données du module Sport + agrégats de semaine (serveur uniquement).
import { prisma } from "@/lib/prisma";
import { parisWeekRange } from "@/lib/date";
import type { SportActivity } from "@/generated/prisma/client";
import { SPORT_TYPES, type WeekStats } from "@/lib/sport-shared";

// Ré-exporte le partagé pour compat des imports serveur existants.
export * from "@/lib/sport-shared";

export async function getWeek(dateStr: string) {
  const { monday, start, end } = parisWeekRange(dateStr);
  const activities = await prisma.sportActivity.findMany({
    where: { date: { gte: new Date(start), lt: new Date(end) } },
    orderBy: { date: "asc" },
  });
  return { monday, activities, stats: aggregate(activities) };
}

export function aggregate(activities: SportActivity[]): WeekStats {
  const byType: Record<string, number> = {};
  let durationSec = 0;
  let distanceM = 0;
  let elevationM = 0;
  for (const a of activities) {
    byType[a.type] = (byType[a.type] ?? 0) + 1;
    durationSec += a.durationSec;
    distanceM += a.distanceM ?? 0;
    elevationM += a.elevationM ?? 0;
  }
  return { count: activities.length, durationSec, distanceM, elevationM, byType };
}

export function getActivity(id: string) {
  return prisma.sportActivity.findUnique({ where: { id } });
}

// --- Objectif hebdomadaire (stocké en AppSetting) ---

export type SportGoal = { minutes: number; km: number; sessions: number };
const GOAL_KEY = "sport.goal";
const DEFAULT_GOAL: SportGoal = { minutes: 240, km: 30, sessions: 3 };

export async function getSportGoal(): Promise<SportGoal> {
  const row = await prisma.appSetting.findUnique({ where: { key: GOAL_KEY } });
  if (!row) return DEFAULT_GOAL;
  try {
    return { ...DEFAULT_GOAL, ...JSON.parse(row.value) };
  } catch {
    return DEFAULT_GOAL;
  }
}

export async function setSportGoal(goal: SportGoal) {
  await prisma.appSetting.upsert({
    where: { key: GOAL_KEY },
    update: { value: JSON.stringify(goal) },
    create: { key: GOAL_KEY, value: JSON.stringify(goal) },
  });
}

export function getHistory(limit = 100) {
  return prisma.sportActivity.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });
}

// Répartit les séances d'une semaine sur 7 jours (lundi → dimanche).
export function weekByDay(activities: SportActivity[], monday: string) {
  const base = new Date(`${monday}T12:00:00Z`);
  const labels = ["L", "M", "M", "J", "V", "S", "D"];
  return labels.map((label, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const of = activities.filter(
      (a) => new Date(a.date).toISOString().slice(0, 10) === iso,
    );
    const segments = SPORT_TYPES.map((type) => ({
      type,
      minutes: of
        .filter((a) => a.type === type)
        .reduce((s, a) => s + Math.round(a.durationSec / 60), 0),
    })).filter((s) => s.minutes > 0);
    return {
      label,
      iso,
      totalMin: segments.reduce((s, x) => s + x.minutes, 0),
      segments,
    };
  });
}
