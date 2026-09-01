"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, FileText, Clapperboard, Trash2 } from "lucide-react";
import Card from "@/components/Card";
import { AGENTS, missingQuestions } from "./engine";
import type { AgentOutput, Conflict } from "./engine/types";
import AgentCard from "./AgentCard";
import ConflictList from "./ConflictList";
import AnalysisTracker from "./AnalysisTracker";
import {
  runAnalysisAction,
  updateAnalysisMeta,
  deleteAnalysis,
  createQuoteFromAnalysis,
  createProjectFromAnalysis,
} from "./actions";

type AnalysisProp = {
  id: string;
  title: string;
  brief: string;
  answers: Record<string, string>;
  engine: "rules" | "llm";
  status: string;
  clientId: string | null;
  quoteId: string | null;
  projectId: string | null;
  outputs: Record<string, AgentOutput>;
  conflicts: Conflict[];
};

export default function AnalysisWorkspace({
  analysis,
  clients,
  aiReady,
  aiProvider,
}: {
  analysis: AnalysisProp;
  clients: { id: string; name: string }[];
  aiReady: boolean;
  aiProvider: "gemini" | "claude" | null;
}) {
  const router = useRouter();
  const [brief, setBrief] = useState(analysis.brief);
  const [answers, setAnswers] = useState<Record<string, string>>(analysis.answers);
  const [engine, setEngine] = useState<"rules" | "llm">(analysis.engine);
  const [clientId, setClientId] = useState(analysis.clientId ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [running, startRun] = useTransition();
  const [saving, startSave] = useTransition();

  const pending = useMemo(
    () => missingQuestions(brief, answers),
    [brief, answers],
  );
  const hasOutputs = Object.keys(analysis.outputs).length > 0;
  const dirty =
    brief !== analysis.brief ||
    engine !== analysis.engine ||
    (clientId || null) !== analysis.clientId ||
    JSON.stringify(answers) !== JSON.stringify(analysis.answers);

  const refresh = () => router.refresh();

  const run = () =>
    startRun(async () => {
      setMsg(null);
      const r = await runAnalysisAction(analysis.id, { brief, answers, engine });
      if (!r.ok) {
        setMsg(r.error);
      } else if (r.degraded.length) {
        setMsg(
          `Analyse en mode ${r.engineUsed}. Agents repliés sur les règles : ${r.degraded.join(" · ")}`,
        );
      } else {
        setMsg(`Analyse terminée (${r.engineUsed}).`);
      }
      refresh();
    });

  const saveMeta = () =>
    startSave(async () => {
      await updateAnalysisMeta(analysis.id, {
        brief,
        answers,
        engine,
        clientId: clientId || null,
      });
      refresh();
    });

  return (
    <div className="space-y-5">
      {/* Brief */}
      <Card title="Brief client">
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={6}
          className="field font-mono text-xs leading-relaxed"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="field max-w-xs"
          >
            <option value="">— Client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 rounded-field border border-line bg-surface-2 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setEngine("rules")}
              className={`rounded px-2 py-1 ${engine === "rules" ? "bg-white text-black" : "text-muted"}`}
            >
              Règles
            </button>
            <button
              type="button"
              disabled={!aiReady}
              onClick={() => setEngine("llm")}
              title={aiReady ? `IA · ${aiProvider}` : "Clé IA requise"}
              className={`rounded px-2 py-1 ${engine === "llm" ? "bg-white text-black" : "text-muted"} disabled:opacity-40`}
            >
              IA {aiReady ? `· ${aiProvider}` : "(off)"}
            </button>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={running || !brief.trim()}
            className="btn-primary"
          >
            <Sparkles size={15} />
            {running ? "Analyse en cours…" : "Analyser avec les agents"}
          </button>
          {dirty && !running && (
            <button
              type="button"
              onClick={saveMeta}
              disabled={saving}
              className="btn-ghost text-xs"
            >
              Enregistrer le brief
            </button>
          )}
        </div>
        {msg && <p className="mt-2 text-xs text-muted">{msg}</p>}
      </Card>

      {/* Questionnaire */}
      {pending.length > 0 && (
        <Card title="Questionnaire — Agent Commercial">
          <p className="mb-3 text-xs text-muted">
            Info manquante dans le brief. Réponds à ce qui est connu, puis relance
            l&apos;analyse.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {pending.map((q) => (
              <label key={q.key} className="block">
                <span className="text-xs text-text">{q.q}</span>
                <input
                  value={answers[q.key] ?? ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.key]: e.target.value })
                  }
                  className="field mt-1"
                />
              </label>
            ))}
          </div>
        </Card>
      )}

      {hasOutputs && (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {AGENTS.map((a) => (
              <AgentCard key={a.id} agent={a} output={analysis.outputs[a.id]} />
            ))}
          </div>

          <Card title="Collaboration inter-agents">
            <ConflictList
              analysisId={analysis.id}
              conflicts={analysis.conflicts}
              onChange={refresh}
            />
          </Card>

          <Card title="Project tracker">
            <AnalysisTracker
              analysisId={analysis.id}
              status={analysis.status}
              outputs={analysis.outputs}
              onChange={refresh}
            />
          </Card>

          <Card title="Générer">
            <div className="flex flex-wrap items-center gap-2">
              {analysis.quoteId ? (
                <Link href={`/mj/devis/${analysis.quoteId}`} className="btn-secondary">
                  <FileText size={15} /> Voir le devis
                </Link>
              ) : (
                <form action={createQuoteFromAnalysis.bind(null, analysis.id)}>
                  <button type="submit" className="btn-primary">
                    <FileText size={15} /> Créer le devis
                  </button>
                </form>
              )}
              {analysis.projectId ? (
                <Link
                  href={`/mj/projets/${analysis.projectId}`}
                  className="btn-secondary"
                >
                  <Clapperboard size={15} /> Voir le projet
                </Link>
              ) : (
                <form action={createProjectFromAnalysis.bind(null, analysis.id)}>
                  <button type="submit" className="btn-secondary">
                    <Clapperboard size={15} /> Créer le projet
                  </button>
                </form>
              )}
              <form
                action={deleteAnalysis.bind(null, analysis.id)}
                className="ml-auto"
              >
                <button
                  type="submit"
                  className="btn-ghost text-xs text-[#FF6A5F]"
                >
                  <Trash2 size={14} /> Supprimer l&apos;analyse
                </button>
              </form>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
