import Link from "next/link";
import { Activity, Plus } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import WeekNav from "./WeekNav";
import FitImport from "./FitImport";
import WeekChart from "./WeekChart";
import GoalCard from "./GoalCard";
import { prisma } from "@/lib/prisma";
import {
  getWeek,
  weekByDay,
  getSportGoal,
  fmtDuration,
  fmtDistance,
  fmtPace,
} from "@/lib/sport";
import { todayInParis, formatWeekLabel, parisWeekRange } from "@/lib/date";

const typeColor: Record<string, "green" | "blue" | "amber" | "gray"> = {
  Course: "green",
  Vélo: "blue",
  Muscu: "amber",
  Autre: "gray",
};

export default async function SportWeekPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string; import?: string }>;
}) {
  const { w, import: importResult } = await searchParams;
  const { monday, activities, stats } = await getWeek(w ?? todayInParis());

  const { start } = parisWeekRange(monday);
  const [report, goal] = await Promise.all([
    prisma.weeklyReport.findFirst({ where: { weekStart: new Date(start) } }),
    getSportGoal(),
  ]);
  const days = weekByDay(activities, monday);
  const progress = {
    minutes: Math.round(stats.durationSec / 60),
    km: stats.distanceM / 1000,
    sessions: stats.count,
  };
  const isThisWeek = w == null || monday === parisWeekRange(todayInParis()).monday;

  return (
    <>
      <PageHeader
        title="Sport"
        subtitle={formatWeekLabel(monday)}
        action={<WeekNav monday={monday} />}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link href="/sport/nouveau" className="btn-primary">
          + Séance
        </Link>
        <FitImport />
        <Link
          href="/sport/historique"
          className="ml-auto text-sm font-medium text-muted hover:text-text hover:underline"
        >
          Historique →
        </Link>
      </div>

      {importResult && (
        <p className="mb-4 rounded-field bg-online/10 px-3 py-2 text-xs text-online">
          Import : {importResult.split("-")[0]} ajoutée(s),{" "}
          {importResult.split("-")[1]} déjà présente(s).
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat value={String(stats.count)} label="séances" />
        <Stat value={fmtDuration(stats.durationSec)} label="temps total" />
        <Stat value={fmtDistance(stats.distanceM)} label="distance" />
        <Stat value={`${Math.round(stats.elevationM)} m`} label="dénivelé +" />
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        {isThisWeek && <GoalCard goal={goal} progress={progress} />}
        <Card title="Volume de la semaine" className={isThisWeek ? "" : "lg:col-span-2"}>
          <WeekChart days={days} />
        </Card>
      </div>

      <Card title="Séances de la semaine" className="mb-5">
        {activities.length === 0 ? (
          <EmptyState
            Icon={Activity}
            title="Aucune séance cette semaine"
            hint="Saisis une séance ou importe un fichier .FIT de ta montre."
            action={
              <Link href="/sport/nouveau" className="btn-primary">
                <Plus size={15} strokeWidth={2} /> Séance
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {activities.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/sport/${a.id}`}
                  className="flex items-center gap-3 py-3 hover:opacity-80"
                >
                  <Badge color={typeColor[a.type] ?? "gray"}>{a.type}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {a.title || a.type}
                      {a.source === "fit" && (
                        <span className="ml-2 font-mono text-[10px] text-muted">
                          .FIT
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {fmtDuration(a.durationSec)}
                      {a.distanceM ? ` · ${fmtDistance(a.distanceM)}` : ""}
                      {a.type === "Course" && a.distanceM
                        ? ` · ${fmtPace(a.durationSec, a.distanceM)}`
                        : ""}
                      {a.avgHr ? ` · ${a.avgHr} bpm` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {new Date(a.date).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Bilan de la semaine">
        {report ? (
          <div
            className="space-y-2 text-sm leading-relaxed [&_h3]:mt-3 [&_h3]:font-semibold"
            dangerouslySetInnerHTML={{ __html: report.content }}
          />
        ) : (
          <p className="text-sm text-muted">
            Pas encore de bilan pour cette semaine. Le compte rendu rédigé
            arrivera à l&apos;étape 2 du module.
          </p>
        )}
      </Card>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
