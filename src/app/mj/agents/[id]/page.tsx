import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import PageHeader from "@/components/PageHeader";
import MjTabs from "../../MjTabs";
import { getAnalysis, getClients } from "@/lib/mj";
import { hasAiKey, aiProviderLabel } from "../llm";
import AnalysisWorkspace from "../AnalysisWorkspace";
import type { AgentOutput, Conflict } from "../engine/types";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const [analysis, clients] = await Promise.all([getAnalysis(id), getClients()]);
  if (!analysis) notFound();

  return (
    <>
      <PageHeader
        title={analysis.title}
        subtitle="Agents IA"
        action={
          <Link
            href="/mj/agents"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Analyses
          </Link>
        }
      />
      <MjTabs />

      <AnalysisWorkspace
        analysis={{
          id: analysis.id,
          title: analysis.title,
          brief: analysis.brief,
          answers: (analysis.answers ?? {}) as Record<string, string>,
          engine: analysis.engine === "llm" ? "llm" : "rules",
          status: analysis.status,
          clientId: analysis.clientId,
          quoteId: analysis.quoteId,
          projectId: analysis.projectId,
          outputs: (analysis.outputs ?? {}) as Record<string, AgentOutput>,
          conflicts: (analysis.conflicts ?? []) as Conflict[],
        }}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        aiReady={hasAiKey()}
        aiProvider={aiProviderLabel()}
      />
    </>
  );
}
