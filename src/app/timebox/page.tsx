import Link from "next/link";
import { CalendarClock, Settings2, ExternalLink } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { SignInWithGoogle } from "@/components/SignInWithGoogle";
import DayNav from "./DayNav";
import { auth } from "@/auth";
import { loadDay } from "@/lib/timebox";
import { formatLongDate, todayInParis } from "@/lib/date";
import { timeBlocks as exampleBlocks } from "@/data/timebox";
import type { BlockCategory, TimeBlock } from "@/lib/types";

const catColor: Record<BlockCategory, string> = {
  BTS: "#a78bfa",
  Sport: "#34d399",
  "M&J": "#f472b6",
  Perso: "#38bdf8",
  Pause: "#9a9a9e",
  Cours: "#fbbf24",
};

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
  const nowHM = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

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

      <div className="mb-4 flex items-center justify-between">
        {isToday && (
          <span className="text-xs text-muted">
            Il est <span className="font-semibold text-text">{nowHM}</span>
          </span>
        )}
        <Link
          href="/parametres"
          className="ml-auto flex items-center gap-1 text-xs font-medium text-muted hover:text-text"
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
              style={{ boxShadow: `inset 3px 0 0 ${catColor[b.category] ?? "#9a9a9e"}` }}
            >
              {b.title}
              <span className="text-xs text-muted">{b.source}</span>
            </span>
          ))}
        </div>
      )}

      <Card>
        {day.timed.length === 0 ? (
          <EmptyState
            Icon={CalendarClock}
            title="Journée libre"
            hint="Aucun événement horaire ce jour-là."
          />
        ) : (
          <ol className="space-y-2">
            {day.timed.map((block) => {
              const current =
                isToday && block.start <= nowHM && block.end >= nowHM;
              return (
                <li
                  key={block.id}
                  className={`flex items-center gap-3 rounded-field border p-3 transition-colors ${
                    current
                      ? "border-white/20 bg-surface-2"
                      : "border-line bg-surface-2/50"
                  }`}
                  style={{
                    boxShadow: `inset 3px 0 0 ${catColor[block.category] ?? "#9a9a9e"}`,
                  }}
                >
                  <div className="w-[4.5rem] shrink-0 text-xs tabular-nums text-muted">
                    {block.start}
                    <span className="block text-faint">{block.end}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {block.htmlLink ? (
                        <a
                          href={block.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          {block.title}
                          <ExternalLink size={11} className="text-faint" />
                        </a>
                      ) : (
                        block.title
                      )}
                    </p>
                    <p className="text-xs text-muted">{block.source}</p>
                  </div>
                  {current && (
                    <span className="chip bg-white/10 text-[10px] text-text">
                      en cours
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>
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
            style={{ boxShadow: `inset 3px 0 0 ${catColor[b.category] ?? "#9a9a9e"}` }}
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
