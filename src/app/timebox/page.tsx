import Link from "next/link";
import { CalendarClock, Settings2 } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { SignInWithGoogle } from "@/components/SignInWithGoogle";
import DayNav from "./DayNav";
import TimeboxDay from "./TimeboxDay";
import { auth } from "@/auth";
import { loadDay } from "@/lib/timebox";
import { categoryColor } from "@/lib/timebox-shared";
import { formatLongDate, todayInParis } from "@/lib/date";
import { timeBlocks as exampleBlocks } from "@/data/timebox";
import type { TimeBlock } from "@/lib/types";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function TimeboxPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? todayInParis();
  const isToday = date === todayInParis();

  if (!session?.user) {
    return (
      <>
        <PageHeader title="Timebox" subtitle="Ton agenda du jour" />
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

  const day = await loadDay(session.user.id, date);

  if (day.status === "reconnect") {
    return (
      <>
        <PageHeader title="Timebox" subtitle="Ton agenda du jour" />
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

  return (
    <>
      <PageHeader
        title="Timebox"
        subtitle={cap(formatLongDate(date))}
        action={<DayNav date={date} />}
      />

      <div className="mb-4 flex items-center justify-end">
        <Link
          href="/parametres"
          className="flex items-center gap-1 text-xs font-medium text-muted hover:text-text"
        >
          <Settings2 size={13} /> Calendriers
        </Link>
      </div>

      {day.failedCount > 0 && (
        <p className="mb-4 rounded-field bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          {day.failedCount} calendrier(s) n&apos;ont pas pu être chargés.
        </p>
      )}

      {day.allDay.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {day.allDay.map((b) => (
            <span
              key={b.id}
              className="chip bg-surface-2 text-sm text-text"
              style={{ boxShadow: `inset 3px 0 0 ${categoryColor(b.category)}` }}
            >
              {b.title}
              <span className="text-xs text-muted">{b.source}</span>
            </span>
          ))}
        </div>
      )}

      <TimeboxDay
        blocks={day.timed}
        isToday={isToday}
        date={date}
        calendars={day.calendars}
      />
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
