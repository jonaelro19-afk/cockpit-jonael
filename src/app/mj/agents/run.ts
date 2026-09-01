// Orchestration serveur d'une analyse : règles et/ou LLM.
// (Importe callLLM → à n'utiliser QUE côté serveur / server action.)
import type {
  AgentDef,
  AgentId,
  AgentOutput,
  AnalysisContext,
  Conflict,
  PriceGrid,
} from "./engine/types";
import { AGENTS, AGENT_MAP } from "./engine";
import { detectConflicts } from "./engine/conflicts";
import { callLLM, AiProviderError } from "./llm";

function ruleOutput(agent: AgentDef, ctx: AnalysisContext, grid: PriceGrid): AgentOutput {
  const r = agent.rules(ctx, grid);
  return {
    agentId: agent.id,
    engine: "rules",
    summary: r.summary,
    facts: r.facts,
    sections: r.sections,
  };
}

// Extrait le premier objet JSON d'un texte libre.
function extractJSON(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function llmOutput(
  agent: AgentDef,
  ctx: AnalysisContext,
  grid: PriceGrid,
): Promise<AgentOutput> {
  const base = agent.rules(ctx, grid);
  try {
    const raw = await callLLM(agent.systemPrompt, agent.userTemplate(ctx), {
      maxTokens: 2048,
    });
    const parsed = extractJSON(raw);
    if (!parsed) {
      return {
        agentId: agent.id,
        engine: "rules",
        degraded: true,
        degradedReason: "réponse LLM non parsable",
        summary: base.summary,
        facts: base.facts,
        sections: base.sections,
        raw,
      };
    }
    const { summary, sections, ...facts } = parsed as {
      summary?: string;
      sections?: { title: string; body: string }[];
    } & Record<string, unknown>;
    return {
      agentId: agent.id,
      engine: "llm",
      summary: typeof summary === "string" && summary ? summary : base.summary,
      facts: { ...base.facts, ...facts },
      sections:
        Array.isArray(sections) && sections.length ? sections : base.sections,
      raw,
    };
  } catch (e) {
    const reason =
      e instanceof AiProviderError
        ? e.kind === "no-key"
          ? "aucune clé IA configurée"
          : e.message
        : String(e);
    return {
      agentId: agent.id,
      engine: "rules",
      degraded: true,
      degradedReason: reason,
      summary: base.summary,
      facts: base.facts,
      sections: base.sections,
    };
  }
}

export type RunResult = {
  outputs: Record<string, AgentOutput>;
  conflicts: Conflict[];
  engineUsed: "rules" | "llm";
};

export async function runAnalysis(opts: {
  ctx: AnalysisContext;
  grid: PriceGrid;
  engine: "rules" | "llm";
  agentIds?: AgentId[];
}): Promise<RunResult> {
  const list = opts.agentIds?.length
    ? AGENTS.filter((a) => opts.agentIds!.includes(a.id))
    : AGENTS;

  let outputs: Record<string, AgentOutput> = {};

  if (opts.engine === "llm") {
    const results = await Promise.all(
      list.map((a) => llmOutput(a, opts.ctx, opts.grid)),
    );
    outputs = Object.fromEntries(results.map((o) => [o.agentId, o]));
  } else {
    for (const a of list) outputs[a.id] = ruleOutput(a, opts.ctx, opts.grid);
  }

  const engineUsed: "rules" | "llm" =
    opts.engine === "llm" && Object.values(outputs).some((o) => o.engine === "llm")
      ? "llm"
      : "rules";

  return { outputs, conflicts: detectConflicts(outputs), engineUsed };
}

export { AGENT_MAP };
