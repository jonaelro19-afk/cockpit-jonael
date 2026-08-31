import Link from "next/link";
import { CalendarClock, Settings2 } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { SignInWithGoogle } from "@/components/SignInWithGoogle";
import PeriodNav from "./PeriodNav";
import ViewSwitcher from "./ViewSwitcher";
import TimeboxGrid from "./TimeboxGrid";
import MonthView from "./MonthView";
import YearView from "./YearView";
import type { GridColumn } from "./ColumnsGrid";
import { auth } from "@/auth";
import { loadRange } from "@/lib/timebox";
import { categoryColor, parseView } from "@/lib/timebox-shared";
import {
  firstOfMonth,
  formatLongDate,
  monthGridDays,
  todayInParis,
  weekDays,
} from "@/lib/date";
import { timeBlocks as exampleBlocks } from "@/data/timebox";
import type { TimeBlock } from "@/lib/types";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function periodLabel(view: string, date: string): string {
  if (view === "jour") return cap(formatLongDate(date));
  if (view === "semaine") {
    const d = weekDays(date);
    const fmt = (x: string, opts: Intl.DateTimeFormatOptions) =>
      new Date(`${x}T12:00:00Z`).toLocaleDateString("fr-FR", {
        ...opts,
        timeZone: "UTC",
      });
    return `${fmt(d[0], { day: "numeric", month: "short" })} – ${fmt(d[6], {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  }
  if (view === "mois")
    return cap(
      new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    );
  return date.slice(0, 4);
}

export default async function TimeboxPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const view = parseView(sp.view);
  const date = sp.date ?? todayInParis();
  const today = todayInParis();

  const header = (action?: React.ReactNode) => (
    <PageHeader title="Timebox" subtitle={periodLabel(view, date)} action={action} />
  );

  if (!session?.user) {
    return (
      <>
        {header()}
        <Card className="mb-5">
          <EmptyState
            Icon={CalendarClock}
            title="Connexion requise"
            hint="Connecte ton compte Google pour afficher ton vrai agenda."
            action={<SignInWithGoogle />}
          />
        </Card>
        <ExampleFallback />
      </>
    );
  }

  // Bornes de chargement selon la vue.
  let start = date;
  let end = date;
  let maxPages = 1;
  if (view === "semaine") {
    const d = weekDays(date);
    start = d[0];
    end = d[6];
  } else if (view === "mois") {
    const g = monthGridDays(date);
    start = g[0];
    end = g[41];
    maxPages = 3;
  } else if (view === "annee") {
    start = `${date.slice(0, 4)}-01-01`;
    end = `${date.slice(0, 4)}-12-31`;
    maxPages = 6;
  }

  const data = await loadRange(session.user.id, start, end, { maxPages });

  if (data.status === "reconnect") {
    return (
      <>
        {header()}
        <Card>
          <EmptyState
            Icon={CalendarClock}
            title="Compte Google à reconnecter"
            hint="L'accès à Google Agenda doit être renouvelé."
            action={<SignInWithGoogle />}
          />
        </Card>
      </>
    );
  }

  const controls = (
    <div className="flex flex-col items-end gap-2">
      <ViewSwitcher view={view} date={date} />
      <PeriodNav view={view} date={date} />
    </div>
  );

  return (
    <>
      {header(controls)}

      <div className="mb-4 flex items-center justify-end">
        <Link
          href="/parametres"
          className="flex items-center gap-1 text-xs font-medium text-muted hover:text-text"
        >
          <Settings2 size={13} /> Calendriers
        </Link>
      </div>

      {data.failedCount > 0 && (
        <p className="mb-4 rounded-field bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          {data.failedCount} calendrier(s) n&apos;ont pas pu être chargés.
        </p>
      )}

      {view === "annee" ? (
        <YearView
          year={Number(date.slice(0, 4))}
          datesWithEvents={[
            ...new Set([...data.timed, ...data.allDay].map((b) => b.date)),
          ]}
        />
      ) : view === "mois" ? (
        <MonthView
          date={firstOfMonth(date)}
          blocks={[...data.allDay, ...data.timed]}
          calendars={data.calendars}
        />
      ) : (
        <>
          {data.allDay.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {data.allDay
                .filter((b) => view === "semaine" || b.date === date)
                .map((b) => (
                  <span
                    key={b.id}
                    className="chip bg-surface-2 text-sm text-text"
                    style={{
                      boxShadow: `inset 3px 0 0 ${categoryColor(b.category)}`,
                    }}
                  >
                    {b.title}
                    <span className="text-xs text-muted">{b.source}</span>
                  </span>
                ))}
            </div>
          )}

          <TimeboxGrid
            columns={
              view === "semaine"
                ? weekDays(date).map((d): GridColumn => ({
                    key: d,
                    date: d,
                    label: cap(
                      new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        timeZone: "UTC",
                      }),
                    ),
                    sublabel: String(Number(d.slice(8, 10))),
                    isToday: d === today,
                  }))
                : [
                    {
                      key: date,
                      date,
                      label: "",
                      isToday: date === today,
                    },
                  ]
            }
            blocks={data.timed}
            calendars={data.calendars}
            defaultDate={view === "semaine" ? weekDays(date)[0] : date}
          />
        </>
      )}
    </>
  );
}

function ExampleFallback() {
  return (
    <Card title="Exemple (non connecté)">
      <ol className="space-y-2 opacity-50">
        {exampleBlocks.map((b: TimeBlock) => (
          <li
            key={b.id}
            className="flex items-center gap-3 rounded-field border border-line bg-surface-2/50 p-3"
            style={{ boxShadow: `inset 3px 0 0 ${categoryColor(b.category)}` }}
          >
            <div className="w-[4.5rem] shrink-0 text-xs tabular-nums text-muted">
              {b.start}
              <span className="block text-faint">{b.end}</span>
            </div>
            <p className="flex-1 truncate text-sm text-text">{b.title}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
