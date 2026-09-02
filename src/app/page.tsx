import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ArrowUpRight } from "lucide-react";
import Card from "@/components/Card";
import { SignInWithGoogle } from "@/components/SignInWithGoogle";
import AddTask from "./taches/AddTask";
import TaskItem from "./taches/TaskItem";
import { auth } from "@/auth";
import { isOwnerEmail } from "@/lib/access";
import { loadDay } from "@/lib/timebox";
import { modules } from "@/lib/modules";
import { formatLongDate, todayInParis } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { getWeek, fmtDuration, fmtDistance } from "@/lib/sport";
import { getProjects, getPipeline, fmtEur, fmtDate } from "@/lib/mj";
import { getUpcomingTasks, getOpenTaskCount } from "@/lib/tasks";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const catColor: Record<string, string> = {
  BTS: "#a78bfa",
  Sport: "#34d399",
  "M&J": "#f472b6",
  Perso: "#38bdf8",
  Pause: "#9a9a9e",
  Cours: "#fbbf24",
};

export default async function DashboardPage() {
  const session = await auth();
  // Un collaborateur M&J n'a pas de tableau de bord perso : on l'envoie sur M&J.
  if (session?.user && !isOwnerEmail(session.user.email)) redirect("/mj");
  const today = todayInParis();

  const day = session?.user ? await loadDay(session.user.id, today) : null;
  const timed = day?.status === "ok" ? day.timed : [];
  const now = new Date();
  const nowHM = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  const upcoming = timed.filter((b) => b.end >= nowHM);
  const nextBlock = upcoming[0];

  const [
    notionCount,
    subjectCount,
    bookmarkedCount,
    week,
    mjProjects,
    pipeline,
    upcomingTasks,
    openTaskCount,
  ] = await Promise.all([
    prisma.notion.count(),
    prisma.subject.count(),
    prisma.notion.count({ where: { bookmarked: true } }),
    getWeek(today),
    getProjects(),
    getPipeline(),
    getUpcomingTasks(5),
    getOpenTaskCount(),
  ]);

  const nextProject = mjProjects.find(
    (p) => p.deadline && p.status !== "Livré" && p.status !== "Annulé",
  );

  const hint: Record<string, string> = {
    timebox: nextBlock
      ? `Prochain : ${nextBlock.title} · ${nextBlock.start}`
      : "Rien de prévu",
    bts: `${subjectCount} matières · ${bookmarkedCount} à revoir`,
    sport: `${fmtDuration(week.stats.durationSec)} · ${fmtDistance(week.stats.distanceM)} cette semaine`,
    mj: nextProject
      ? `${nextProject.client?.name ?? nextProject.title} · ${fmtDate(nextProject.deadline)}`
      : "Aucune échéance",
    gmail: "Tri des non-lus",
    taches: openTaskCount > 0 ? "à faire" : "tout est fait",
  };
  const value: Record<string, string> = {
    timebox: `${timed.length} blocs`,
    bts: `${notionCount} notions`,
    sport: `${week.stats.count} séances`,
    mj: `${pipeline.activeCount} actifs · ${fmtEur(pipeline.deliveredEur)}`,
    gmail: "Récap matin",
    taches: `${openTaskCount}`,
  };

  return (
    <>
      {/* Hero */}
      <header className="relative mb-8 overflow-hidden rounded-card border border-line bg-surface p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "linear-gradient(120deg,#ffd23f,#ff7a3d,#ff4fa0,#b14fff)",
          }}
        />
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          {cap(formatLongDate(today))}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Bonjour Jonael
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          {nextBlock
            ? `Prochain bloc à ${nextBlock.start} — ${nextBlock.title}.`
            : timed.length > 0
              ? "Journée bien remplie."
              : "Journée libre pour l'instant."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/sport/nouveau" className="btn-secondary">
            <Plus size={15} strokeWidth={2} /> Séance
          </Link>
          <Link href="/mj/projets/nouveau" className="btn-secondary">
            <Plus size={15} strokeWidth={2} /> Projet
          </Link>
          <Link href="/mj/devis/nouveau" className="btn-secondary">
            <Plus size={15} strokeWidth={2} /> Devis
          </Link>
          <Link href="/timebox" className="btn-ghost">
            Voir l&apos;agenda
          </Link>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
        {/* Aujourd'hui */}
        <Card
          title="Aujourd'hui"
          action={
            <Link
              href="/timebox"
              className="flex items-center gap-0.5 text-xs font-medium text-muted hover:text-text"
            >
              Timebox <ArrowUpRight size={13} />
            </Link>
          }
        >
          {!session?.user ? (
            <div className="py-4">
              <p className="mb-3 text-sm text-muted">
                Connecte Google pour voir ton agenda du jour.
              </p>
              <SignInWithGoogle callbackUrl="/" />
            </div>
          ) : day?.status === "reconnect" ? (
            <div className="py-4">
              <p className="mb-3 text-sm text-muted">Session Google à renouveler.</p>
              <SignInWithGoogle callbackUrl="/" />
            </div>
          ) : timed.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Rien de planifié aujourd&apos;hui.
            </p>
          ) : (
            <ol className="relative ml-1 space-y-0.5 border-l border-line pl-4">
              {(upcoming.length > 0 ? upcoming : timed).slice(0, 9).map((b) => (
                <li key={b.id} className="relative py-1.5">
                  <span
                    className="absolute -left-[1.36rem] top-3 h-2 w-2 rounded-full ring-2 ring-surface"
                    style={{ background: catColor[b.category] ?? "#9a9a9e" }}
                  />
                  <div className="flex items-baseline gap-2">
                    <span className="w-24 shrink-0 text-xs tabular-nums text-muted">
                      {b.start}–{b.end}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-text">
                      {b.title}
                    </span>
                    <span className="hidden text-xs text-muted sm:block">
                      {b.source}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {/* À faire */}
        <Card
          title={`À faire${openTaskCount ? ` — ${openTaskCount}` : ""}`}
          action={
            <Link
              href="/taches"
              className="flex items-center gap-0.5 text-xs font-medium text-muted hover:text-text"
            >
              Toutes <ArrowUpRight size={13} />
            </Link>
          }
        >
          <div className="mb-3">
            <AddTask />
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted">
              Rien en attente 🎉
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {upcomingTasks.map((t) => (
                <TaskItem key={t.id} task={t} />
              ))}
            </ul>
          )}
        </Card>
        </div>

        {/* Modules */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {modules
            .filter((m) => m.key !== "dashboard")
            .map((m) => (
              <Link
                key={m.key}
                href={m.href}
                className="group flex items-center gap-4 rounded-card border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `${m.color}1f`, color: m.color }}
                >
                  <m.Icon size={20} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.label}</p>
                  <p className="truncate text-xs text-muted">{hint[m.key]}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{value[m.key]}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </>
  );
}
