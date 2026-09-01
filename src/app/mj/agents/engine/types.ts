// Types partagés du sous-module « Agents IA » de M&J Prod.
// Importable côté client comme côté serveur (aucun accès BDD ici).

export type AgentId =
  | "commercial"
  | "planning"
  | "creative"
  | "editing"
  | "marketing";

export type AgentSection = { title: string; body: string };

export type AgentOutput = {
  agentId: AgentId;
  engine: "rules" | "llm";
  degraded?: boolean; // LLM a échoué → contenu issu des règles
  degradedReason?: string;
  patched?: boolean; // un conflit a modifié ce résultat
  summary: string;
  facts: Record<string, unknown>;
  sections: AgentSection[];
  raw?: string; // texte brut LLM (debug)
};

export type AnalysisContext = {
  brief: string;
  answers: Record<string, string>;
  refDate: string; // ISO "YYYY-MM-DD" — date de référence déterministe
};

export type ConflictPatch = {
  agent: AgentId;
  facts?: Record<string, unknown>;
  push?: { key: string; value: unknown };
};

export type Conflict = {
  id: string;
  between: [string, string];
  field: string;
  message: string;
  suggestion?: string;
  patch?: ConflictPatch;
  resolved?: { choice: "apply" | "keep" | "auto"; by: "user" | "system" };
};

export type AgentRulesResult = {
  summary: string;
  facts: Record<string, unknown>;
  sections: AgentSection[];
};

export type PriceGrid = Record<
  string,
  {
    label: string;
    base?: number;
    monthly?: number;
    min?: number;
    max?: number;
    shootDays?: number;
    revisions?: number;
    contractMonths?: number;
  }
>;

export type AgentDef = {
  id: AgentId;
  label: string;
  icon: string; // nom d'icône lucide
  accent: string; // hex
  outputSchema: Record<string, string>;
  systemPrompt: string;
  userTemplate: (ctx: AnalysisContext) => string;
  rules: (ctx: AnalysisContext, grid: PriceGrid) => AgentRulesResult;
};
