// Accès aux données Prospection M&J + calcul des indicateurs.
import { prisma } from "@/lib/prisma";
import {
  ACTIVE_STATUSES,
  PROSPECT_STATUSES,
  needsFollowUp,
} from "@/lib/prospection-shared";

export * from "@/lib/prospection-shared";

export function getProspects() {
  return prisma.prospect.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { _count: { select: { interactions: true } } },
  });
}

export function getProspect(id: string) {
  return prisma.prospect.findUnique({
    where: { id },
    include: { interactions: { orderBy: { date: "desc" } } },
  });
}

export type ProspectionStats = {
  total: number;
  bySegment: { segment: string; n: number }[];
  byStatus: { status: string; n: number }[];
  conversion: number; // %
  pipelineEur: number; // budget des prospects actifs
  wonEur: number; // budget des contrats signés
  toFollowUp: {
    id: string;
    name: string;
    status: string;
    lastContact: Date | null;
  }[];
  nextMeetings: {
    id: string;
    name: string;
    date: Date;
    kind: string;
    summary: string;
  }[];
};

export async function getProspectionStats(): Promise<ProspectionStats> {
  const [prospects, upcoming] = await Promise.all([
    prisma.prospect.findMany(),
    prisma.prospectInteraction.findMany({
      where: { nextAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      orderBy: { nextAt: "asc" },
      include: { prospect: { select: { id: true, name: true } } },
      take: 8,
    }),
  ]);

  const total = prospects.length;
  const signed = prospects.filter((p) => p.status === "Contrat signé").length;

  const segMap = new Map<string, number>();
  for (const p of prospects)
    segMap.set(p.segment, (segMap.get(p.segment) ?? 0) + 1);

  return {
    total,
    bySegment: [...segMap.entries()]
      .map(([segment, n]) => ({ segment, n }))
      .sort((a, b) => b.n - a.n),
    byStatus: PROSPECT_STATUSES.map((status) => ({
      status,
      n: prospects.filter((p) => p.status === status).length,
    })).filter((s) => s.n > 0),
    conversion: total ? Math.round((signed / total) * 100) : 0,
    pipelineEur: prospects
      .filter((p) => ACTIVE_STATUSES.includes(p.status))
      .reduce((s, p) => s + (p.budgetEur ?? 0), 0),
    wonEur: prospects
      .filter((p) => p.status === "Contrat signé")
      .reduce((s, p) => s + (p.budgetEur ?? 0), 0),
    toFollowUp: prospects
      .filter(needsFollowUp)
      .sort(
        (a, b) =>
          (a.lastContact?.getTime() ?? 0) - (b.lastContact?.getTime() ?? 0),
      )
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        lastContact: p.lastContact,
      })),
    nextMeetings: upcoming.map((i) => ({
      id: i.prospect.id,
      name: i.prospect.name,
      date: i.nextAt!,
      kind: i.kind,
      summary: i.summary,
    })),
  };
}
