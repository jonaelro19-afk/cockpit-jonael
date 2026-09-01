import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import MjTabs from "../MjTabs";
import { getAnalyses, getClients } from "@/lib/mj";
import { fmtDate } from "@/lib/mj-shared";
import { createAnalysis } from "./actions";
import { hasAiKey, aiProviderLabel } from "./llm";

const STATUS_BADGE: Record<
  string,
  "gray" | "blue" | "amber" | "purple" | "green"
> = {
  brief: "gray",
  devis: "blue",
  tournage: "amber",
  montage: "purple",
  livraison: "green",
  archive: "gray",
};

export default async function AgentsPage() {
  const [analyses, clients] = await Promise.all([getAnalyses(), getClients()]);
  const aiReady = hasAiKey();
  const provider = aiProviderLabel();

  return (
    <>
      <PageHeader
        title="M&J Prod"
        subtitle="Agents IA — analyse d'un brief par 5 agents métier"
      />
      <MjTabs />

      <Card title="Nouveau brief" className="mb-5">
        <form action={createAnalysis} className="space-y-3">
          <textarea
            name="brief"
            required
            rows={6}
            placeholder={`Client : CJD Toulouse\nÉvénement : gala prestige, 200 dirigeants\nDate : 15 novembre 2026 · Théâtre Barrière\nLivrable : aftermovie 4 min · extraits discours + networking\nDeadline : 25 novembre`}
            className="field font-mono text-xs leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-3">
            <select name="clientId" defaultValue="" className="field max-w-xs">
              <option value="">— Client (optionnel) —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select name="engine" defaultValue="rules" className="field max-w-[12rem]">
              <option value="rules">Moteur : règles</option>
              <option value="llm" disabled={!aiReady}>
                Moteur : IA {aiReady ? `(${provider})` : "(clé requise)"}
              </option>
            </select>
            <button type="submit" className="btn-primary">
              <Sparkles size={15} /> Créer l&apos;analyse
            </button>
          </div>
          {!aiReady && (
            <p className="text-xs text-muted">
              Mode <strong>règles</strong> : analyse locale déterministe (grille M&J +
              tarifs Cockpit). Le mode IA s&apos;active dès que <code>GEMINI_API_KEY</code>{" "}
              (gratuit) ou <code>ANTHROPIC_API_KEY</code> est configurée.
            </p>
          )}
        </form>
      </Card>

      <Card title={`Analyses — ${analyses.length}`}>
        {analyses.length === 0 ? (
          <EmptyState
            Icon={Bot}
            title="Aucune analyse"
            hint="Colle un brief client ci-dessus : les 5 agents (commercial, planning, créatif, montage, marketing) le décortiquent en parallèle."
          />
        ) : (
          <ul className="divide-y divide-line">
            {analyses.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/mj/agents/${a.id}`}
                  className="flex items-center gap-3 py-3 hover:opacity-80"
                >
                  <Badge color={STATUS_BADGE[a.status] ?? "gray"}>{a.status}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {a.client?.name ? `${a.client.name} — ` : ""}
                      {a.title}
                    </p>
                    <p className="text-xs text-muted">
                      {a.engine === "llm" ? "IA" : "règles"} ·{" "}
                      {a.quoteId ? "devis généré · " : ""}
                      {fmtDate(a.updatedAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
