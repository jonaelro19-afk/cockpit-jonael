// Registre des agents + exécution du moteur « règles » (déterministe, sans réseau).
import type {
  AgentDef,
  AgentId,
  AgentOutput,
  AnalysisContext,
  PriceGrid,
} from "./types";
import { GRILLE_MJ } from "./grid";
import commercial from "./commercial";
import planning from "./planning";
import creative from "./creative";
import editing from "./editing";
import marketing from "./marketing";

export const AGENTS: AgentDef[] = [
  commercial,
  planning,
  creative,
  editing,
  marketing,
];

export const AGENT_MAP: Record<AgentId, AgentDef> = {
  commercial,
  planning,
  creative,
  editing,
  marketing,
};

export { missingQuestions } from "./commercial";
export * from "./types";
export { detectConflicts, applyConflictPatch } from "./conflicts";
export { fmtDateFR } from "./timeline";
export { GRILLE_MJ, resolveGrid } from "./grid";

export function runRules(
  ctx: AnalysisContext,
  grid: PriceGrid = GRILLE_MJ,
  agentIds?: AgentId[],
): Record<string, AgentOutput> {
  const list = agentIds?.length
    ? AGENTS.filter((a) => agentIds.includes(a.id))
    : AGENTS;
  const out: Record<string, AgentOutput> = {};
  for (const agent of list) {
    const r = agent.rules(ctx, grid);
    out[agent.id] = {
      agentId: agent.id,
      engine: "rules",
      summary: r.summary,
      facts: r.facts,
      sections: r.sections,
    };
  }
  return out;
}
