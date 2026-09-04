import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Target, AlarmClock, CalendarClock, TrendingUp } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import MjTabs from "../MjTabs";
import QuickStatus from "./QuickStatus";
import { auth } from "@/auth";
import { getProspects, getProspectionStats } from "@/lib/prospection";
import {
  PROSPECT_STATUSES,
  statusMeta,
  priorityMeta,
  needsFollowUp,
  fmtEur0,
} from "@/lib/prospection-shared";
import { fmtDate, relativeDays } from "@/lib/mj-shared";

export default async function ProspectionPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const [prospects, stats] = await Promise.all([
    getProspects(),
    getProspectionStats(),
  ]);

  const rank = (pr: string) => priorityMeta[pr]?.rank ?? 1;
  const byStatus = PROSPECT_STATUSES.map((status) => ({
    status,
    items: prospects
      .filter((p) => p.status === status)
      .sort((a, b) => rank(a.priority) - rank(b.priority)),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        title="M&J Prod"
        subtitle="Prospection — le pipeline commercial"
        action={
          <Link href="/mj/prospection/nouveau" className="btn-primary">
            <Plus size={15} /> Prospect
          </Link>
        }
      />
      <MjTabs />

      {prospects.length === 0 ? (
        <Card>
          <EmptyState
            Icon={Target}
            title="Aucun prospect"
            hint="Ajoute les entreprises à démarcher : fleuristes, restaurants, clubs d'affaires… et suis chaque échange."
            action={
              <Link href="/mj/prospection/nouveau" className="btn-primary">
                <Plus size={15} /> Ajouter un prospect
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Synthèse */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Prospects"
              value={String(stats.total)}
              sub={`${stats.byStatus.find((s) => s.status === "Contrat signé")?.n ?? 0} signés`}
              Icon={Target}
              color="#f472b6"
            />
            <StatTile
              label="Conversion"
              value={`${stats.conversion} %`}
              sub="signés / total"
              Icon={TrendingUp}
              color="#34d399"
            />
            <StatTile
              label="Pipeline"
              value={fmtEur0(stats.pipelineEur)}
              sub="budgets en discussion"
              Icon={TrendingUp}
              color="#fbbf24"
            />
            <StatTile
              label="À relancer"
              value={String(stats.toFollowUp.length)}
              sub={`> ${21} j sans contact`}
              Icon={AlarmClock}
              color="#f87171"
            />
          </div>

          {(stats.toFollowUp.length > 0 || stats.nextMeetings.length > 0) && (
            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              {stats.toFollowUp.length > 0 && (
                <Card title="À relancer en priorité">
                  <ul className="space-y-1.5">
                    {stats.toFollowUp.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/mj/prospection/${p.id}`}
                          className="flex items-center justify-between gap-2 rounded-field px-2 py-1.5 text-sm hover:bg-surface-2"
                        >
                          <span className="truncate font-medium">{p.name}</span>
                          <span className="shrink-0 text-xs text-muted">
                            {p.lastContact
                              ? `vu ${relativeDays(p.lastContact)}`
                              : "jamais contacté"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {stats.nextMeetings.length > 0 && (
                <Card title="Prochains rendez-vous">
                  <ul className="space-y-1.5">
                    {stats.nextMeetings.map((m, i) => (
                      <li key={i}>
                        <Link
                          href={`/mj/prospection/${m.id}`}
                          className="flex items-center gap-2 rounded-field px-2 py-1.5 text-sm hover:bg-surface-2"
                        >
                          <CalendarClock size={14} className="shrink-0 text-muted" />
                          <span className="truncate font-medium">{m.name}</span>
                          <span className="ml-auto shrink-0 text-xs text-muted">
                            {fmtDate(m.date)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}

          {/* Pipeline par statut */}
          <div className="space-y-6">
            {byStatus.map((g) => (
              <section key={g.status}>
                <h2 className="mb-2 flex items-center gap-2 border-b border-line pb-1.5 text-sm font-bold">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: statusMeta[g.status]?.dot }}
                  />
                  {g.status}
                  <span className="text-xs font-normal text-faint">
                    {g.items.length}
                  </span>
                </h2>
                <ul className="space-y-2">
                  {g.items.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/mj/prospection/${p.id}`}
                        className="flex items-center gap-3 rounded-field border border-line bg-surface px-4 py-3 hover:bg-surface-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                            {p.priority !== "normale" && (
                              <span
                                className="shrink-0 text-[10px]"
                                title={priorityMeta[p.priority]?.label}
                                style={{ color: priorityMeta[p.priority]?.color }}
                              >
                                {p.priority === "haute" ? "▲" : "▽"}
                              </span>
                            )}
                            {p.name}
                            {needsFollowUp(p) && (
                              <AlarmClock
                                size={12}
                                className="shrink-0 text-live"
                              />
                            )}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {p.segment}
                            {p.contactName ? ` · ${p.contactName}` : ""}
                            {p.budgetEur ? ` · ${fmtEur0(p.budgetEur)}` : ""}
                            {p._count.interactions
                              ? ` · ${p._count.interactions} échange${p._count.interactions > 1 ? "s" : ""}`
                              : ""}
                          </p>
                        </div>
                        <QuickStatus id={p.id} status={p.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Répartition par segment */}
          <Card title="Par segment" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {stats.bySegment.map((s) => (
                <span key={s.segment} className="chip bg-surface-2 text-xs">
                  {s.segment}
                  <span className="text-muted">{s.n}</span>
                </span>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}

function StatTile({
  label,
  value,
  sub,
  Icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          className="grid h-7 w-7 place-items-center rounded-lg"
          style={{ background: `${color}22`, color }}
        >
          <Icon size={15} />
        </span>
        <span className="text-xs text-muted">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px] text-faint">{sub}</p>
    </div>
  );
}
