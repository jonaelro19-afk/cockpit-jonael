"use server";
// Server actions du sous-module « Agents IA » de M&J Prod.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTarifs, nextQuoteNumber } from "@/lib/mj";
import { resolveGrid } from "./engine/grid";
import { runAnalysis } from "./run";
import {
  detectConflicts,
  applyConflictPatch,
} from "./engine/conflicts";
import type {
  AgentId,
  AgentOutput,
  Conflict,
} from "./engine/types";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function refresh(id?: string) {
  revalidatePath("/mj", "layout");
  if (id) revalidatePath(`/mj/agents/${id}`);
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const refDate = () => new Date().toISOString().slice(0, 10);

function titleFromBrief(brief: string): string {
  const line = brief
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)[0];
  if (!line) return "Analyse";
  return line.replace(/^client\s*[:\-]\s*/i, "").slice(0, 60) || "Analyse";
}

// ---------- CRUD ----------

export async function createAnalysis(fd: FormData) {
  await requireAuth();
  const brief = str(fd, "brief");
  const a = await prisma.mjAnalysis.create({
    data: {
      brief,
      title: titleFromBrief(brief),
      clientId: str(fd, "clientId") || null,
      engine: str(fd, "engine") === "llm" ? "llm" : "rules",
    },
  });
  refresh();
  redirect(`/mj/agents/${a.id}`);
}

export async function updateAnalysisMeta(
  id: string,
  input: { brief?: string; answers?: Record<string, string>; clientId?: string | null; engine?: "rules" | "llm" },
) {
  await requireAuth();
  await prisma.mjAnalysis.update({
    where: { id },
    data: {
      ...(input.brief !== undefined
        ? { brief: input.brief, title: titleFromBrief(input.brief) }
        : {}),
      ...(input.answers !== undefined ? { answers: input.answers } : {}),
      ...(input.clientId !== undefined ? { clientId: input.clientId || null } : {}),
      ...(input.engine !== undefined ? { engine: input.engine } : {}),
    },
  });
  refresh(id);
}

export async function deleteAnalysis(id: string) {
  await requireAuth();
  await prisma.mjAnalysis.delete({ where: { id } });
  refresh();
  redirect("/mj/agents");
}

export async function setAnalysisStatus(id: string, status: string) {
  await requireAuth();
  await prisma.mjAnalysis.update({ where: { id }, data: { status } });
  refresh(id);
}

export async function toggleChecklistItem(id: string, index: number) {
  await requireAuth();
  const a = await prisma.mjAnalysis.findUnique({ where: { id } });
  if (!a) return;
  const outputs = (a.outputs ?? {}) as Record<string, AgentOutput>;
  const planning = outputs.planning;
  const checklist = planning?.facts?.checklist as
    | { label: string; done: boolean }[]
    | undefined;
  if (!checklist?.[index]) return;
  checklist[index] = { ...checklist[index], done: !checklist[index].done };
  await prisma.mjAnalysis.update({
    where: { id },
    data: { outputs: outputs as object },
  });
  refresh(id);
}

// ---------- Analyse ----------

export type RunState =
  | { ok: true; engineUsed: "rules" | "llm"; degraded: string[] }
  | { ok: false; error: string };

export async function runAnalysisAction(
  id: string,
  input: {
    brief: string;
    answers: Record<string, string>;
    engine: "rules" | "llm";
    agentIds?: AgentId[];
  },
): Promise<RunState> {
  try {
    await requireAuth();
    const tarifs = await getTarifs().catch(() => []);
    const grid = resolveGrid(tarifs);

    const { outputs, conflicts, engineUsed } = await runAnalysis({
      ctx: { brief: input.brief, answers: input.answers, refDate: refDate() },
      grid,
      engine: input.engine,
      agentIds: input.agentIds,
    });

    await prisma.mjAnalysis.update({
      where: { id },
      data: {
        brief: input.brief,
        title: titleFromBrief(input.brief),
        answers: input.answers,
        engine: input.engine,
        outputs: outputs as object,
        conflicts: conflicts as object,
        status: "devis",
      },
    });
    refresh(id);

    const degraded = Object.values(outputs)
      .filter((o) => o.degraded)
      .map((o) => `${o.agentId} : ${o.degradedReason}`);
    return { ok: true, engineUsed, degraded };
  } catch (e) {
    console.error("runAnalysisAction", e);
    return { ok: false, error: e instanceof Error ? e.message : "Échec de l'analyse." };
  }
}

export async function resolveConflictAction(
  id: string,
  conflictId: string,
  choice: "apply" | "keep",
) {
  await requireAuth();
  const a = await prisma.mjAnalysis.findUnique({ where: { id } });
  if (!a) return;

  let outputs = (a.outputs ?? {}) as Record<string, AgentOutput>;
  let conflicts = (a.conflicts ?? []) as Conflict[];
  const conflict = conflicts.find((c) => c.id === conflictId);
  if (!conflict) return;

  if (choice === "apply") {
    outputs = applyConflictPatch(outputs, conflict) as Record<string, AgentOutput>;
  }
  conflicts = conflicts.map((c) =>
    c.id === conflictId ? { ...c, resolved: { choice, by: "user" } } : c,
  );
  if (choice === "apply") {
    const stillActive = new Set(detectConflicts(outputs).map((f) => f.id));
    conflicts = conflicts.map((c) =>
      c.resolved || stillActive.has(c.id)
        ? c
        : { ...c, resolved: { choice: "auto", by: "system" } },
    );
  }

  await prisma.mjAnalysis.update({
    where: { id },
    data: { outputs: outputs as object, conflicts: conflicts as object },
  });
  refresh(id);
}

// ---------- Génération devis / projet ----------

export async function createQuoteFromAnalysis(id: string) {
  await requireAuth();
  const a = await prisma.mjAnalysis.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!a) return;
  const outputs = (a.outputs ?? {}) as Record<string, AgentOutput>;
  const c = outputs.commercial?.facts as
    | {
        lines?: { label: string; amountEUR: number }[];
        amountEUR?: number;
        revisions?: number;
        contractMonths?: number | null;
      }
    | undefined;
  if (!c) return;

  const lines = (c.lines?.length
    ? c.lines
    : [{ label: "Prestation vidéo", amountEUR: c.amountEUR ?? 0 }]
  ).map((l, i) => ({
    label: l.label,
    detail: "",
    quantity: 1,
    unit: "forfait",
    unitPrice: l.amountEUR,
    position: i,
  }));

  const quote = await prisma.quote.create({
    data: {
      number: await nextQuoteNumber(),
      clientId: a.clientId,
      title: a.title,
      status: "Brouillon",
      vatRate: 0,
      notes: [
        `Généré depuis l'analyse Agents IA du ${a.createdAt.toLocaleDateString("fr-FR")}.`,
        c.contractMonths ? `Engagement ${c.contractMonths} mois.` : "Prestation one-shot.",
        `Révisions incluses : ${c.revisions ?? 2} A/R.`,
      ].join("\n"),
      lines: { create: lines },
    },
  });

  await prisma.mjAnalysis.update({
    where: { id },
    data: { quoteId: quote.id },
  });
  refresh(id);
  redirect(`/mj/devis/${quote.id}`);
}

export async function createProjectFromAnalysis(id: string) {
  await requireAuth();
  const a = await prisma.mjAnalysis.findUnique({ where: { id } });
  if (!a) return;
  const outputs = (a.outputs ?? {}) as Record<string, AgentOutput>;
  const commercial = outputs.commercial?.facts as
    | { amountEUR?: number } | undefined;
  const planning = outputs.planning?.facts as
    | { shootDate?: string | null; finalDue?: string | null } | undefined;

  const project = await prisma.project.create({
    data: {
      title: a.title,
      clientId: a.clientId,
      kind: "Vidéo",
      status: "Devis",
      shootDate: planning?.shootDate ? new Date(planning.shootDate) : null,
      deadline: planning?.finalDue ? new Date(planning.finalDue) : null,
      budgetEur:
        typeof commercial?.amountEUR === "number"
          ? Math.round(commercial.amountEUR)
          : null,
      notes: `Créé depuis l'analyse Agents IA.`,
    },
  });

  await prisma.mjAnalysis.update({
    where: { id },
    data: { projectId: project.id, status: "tournage" },
  });
  refresh(id);
  redirect(`/mj/projets/${project.id}`);
}
