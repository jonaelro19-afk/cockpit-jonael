import Link from "next/link";
import { Clapperboard, Plus } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import MjTabs from "./MjTabs";
import Timeline from "./Timeline";
import { getProjects, getPipeline, statusMeta, fmtEur, fmtDate } from "@/lib/mj";

function toTimeline(projects: Awaited<ReturnType<typeof getProjects>>) {
  return projects.map((p) => ({
    id: p.id,
    title: p.title,
    kind: p.kind,
    status: p.status,
    clientName: p.client?.name ?? null,
    shootDate: p.shootDate ? p.shootDate.toISOString() : null,
    deadline: p.deadline ? p.deadline.toISOString() : null,
    budgetEur: p.budgetEur,
    notes: p.notes,
  }));
}

export default async function MjOverviewPage() {
  const [projects, pipeline] = await Promise.all([getProjects(), getPipeline()]);

  const upcoming = projects
    .filter((p) => p.status !== "Livré" && p.status !== "Annulé")
    .slice(0, 8);

  return (
    <>
      <PageHeader
        title="M&J Prod"
        subtitle="Vue d'ensemble"
        action={
          <Link href="/mj/projets/nouveau" className="btn-primary">
            + Projet
          </Link>
        }
      />
      <MjTabs />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-2xl font-extrabold tracking-tight">
            {pipeline.activeCount}
          </p>
          <p className="text-xs text-muted">projets actifs</p>
        </Card>
        <Card>
          <p className="text-2xl font-extrabold tracking-tight text-lime">
            {fmtEur(pipeline.deliveredEur)}
          </p>
          <p className="text-xs text-muted">
            encaissé · {pipeline.deliveredCount} projet
            {pipeline.deliveredCount > 1 ? "s" : ""} livré
            {pipeline.deliveredCount > 1 ? "s" : ""}
          </p>
        </Card>
        <Card>
          <p className="text-2xl font-extrabold tracking-tight">
            {fmtEur(pipeline.pipelineEur)}
          </p>
          <p className="text-xs text-muted">pipeline en cours</p>
        </Card>
      </div>

      <Card title="Frise des échéances" className="mb-5">
        <Timeline projects={toTimeline(projects)} />
      </Card>

      <Card title="Prochaines échéances">
        {upcoming.length === 0 ? (
          <EmptyState
            Icon={Clapperboard}
            title="Aucun projet en cours"
            hint="Crée un projet : client, dates de tournage et de livraison, budget."
            action={
              <Link href="/mj/projets/nouveau" className="btn-primary">
                <Plus size={15} strokeWidth={2} /> Projet
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {upcoming.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/mj/projets/${p.id}`}
                  className="flex items-center gap-3 py-3 hover:opacity-80"
                >
                  <Badge color={statusMeta[p.status]?.badge ?? "gray"}>
                    {p.status}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {p.client?.name ? `${p.client.name} — ` : ""}
                      {p.title}
                    </p>
                    <p className="text-xs text-muted">
                      {p.kind}
                      {p.budgetEur != null ? ` · ${fmtEur(p.budgetEur)}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {fmtDate(p.deadline)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
