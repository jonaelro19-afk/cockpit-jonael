import Link from "next/link";
import { monthGridDays, todayInParis } from "@/lib/date";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const WD = ["L", "M", "M", "J", "V", "S", "D"];

function MiniMonth({
  year,
  month,
  busy,
}: {
  year: number;
  month: number; // 0-11
  busy: Set<string>;
}) {
  const anchor = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const days = monthGridDays(anchor);
  const today = todayInParis();
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;

  return (
    <div className="rounded-card border border-line bg-surface p-3">
      <Link
        href={`/timebox?view=mois&date=${anchor}`}
        className="mb-1 block text-xs font-semibold hover:underline"
      >
        {MONTHS[month]}
      </Link>
      <div className="grid grid-cols-7 text-center text-[9px] text-faint">
        {WD.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = day.slice(0, 7) === key;
          const isToday = day === today;
          const hasEvents = busy.has(day);
          return (
            <Link
              key={day}
              href={`/timebox?view=jour&date=${day}`}
              className={`flex aspect-square items-center justify-center rounded-full text-[10px] tabular-nums ${
                isToday
                  ? "bg-live font-semibold text-white"
                  : inMonth
                    ? hasEvents
                      ? "font-medium text-text"
                      : "text-muted"
                    : "text-faint/40"
              } ${hasEvents && !isToday ? "bg-white/10" : ""}`}
            >
              {Number(day.slice(8, 10))}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function YearView({
  year,
  datesWithEvents,
}: {
  year: number;
  datesWithEvents: string[];
}) {
  const busy = new Set(datesWithEvents);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }, (_, m) => (
        <MiniMonth key={m} year={year} month={m} busy={busy} />
      ))}
    </div>
  );
}
