"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TimeBlock, TimeboxCalendar } from "@/lib/types";
import { categoryColor } from "@/lib/timebox-shared";
import { monthGridDays, todayInParis } from "@/lib/date";
import CreateEventPanel, { type Draft } from "./CreateEventPanel";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function MonthView({
  date,
  blocks,
  calendars,
}: {
  date: string;
  blocks: TimeBlock[];
  calendars: TimeboxCalendar[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const today = todayInParis();
  const month = date.slice(0, 7);

  const days = useMemo(() => monthGridDays(date), [date]);
  const byDay = useMemo(() => {
    const map = new Map<string, TimeBlock[]>();
    for (const b of blocks) {
      const arr = map.get(b.date) ?? [];
      arr.push(b);
      map.set(b.date, arr);
    }
    for (const arr of map.values())
      arr.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.startMin - b.startMin);
    return map;
  }, [blocks]);

  return (
    <>
      <div className="rounded-card border border-line bg-surface p-2">
        <div className="grid grid-cols-7 border-b border-line pb-1 text-center text-[11px] text-muted">
          {WEEKDAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const inMonth = day.slice(0, 7) === month;
            const isToday = day === today;
            const items = byDay.get(day) ?? [];
            return (
              <div
                key={day}
                onClick={() =>
                  setDraft({ date: day, start: "09:00", end: "10:00" })
                }
                className={`min-h-[92px] cursor-copy border-b border-r border-line p-1 last:border-r-0 ${
                  inMonth ? "" : "bg-black/20 text-faint"
                }`}
              >
                <div className="mb-1 flex justify-end">
                  <Link
                    href={`/timebox?view=jour&date=${day}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] tabular-nums hover:bg-white/10 ${
                      isToday ? "bg-live font-semibold text-white" : "text-muted"
                    }`}
                  >
                    {Number(day.slice(8, 10))}
                  </Link>
                </div>

                <div className="space-y-0.5">
                  {items.slice(0, 3).map((b) => (
                    <a
                      key={b.id}
                      href={b.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!b.htmlLink) e.preventDefault();
                      }}
                      className="block truncate rounded px-1 text-[10px] font-medium leading-4 text-[#0a0a0a] no-underline"
                      style={{ background: categoryColor(b.category) }}
                      title={`${b.allDay ? "" : b.start + " "}${b.title}`}
                    >
                      {!b.allDay && (
                        <span className="opacity-70">{b.start} </span>
                      )}
                      {b.title}
                    </a>
                  ))}
                  {items.length > 3 && (
                    <p className="px-1 text-[10px] text-muted">
                      +{items.length - 3}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateEventPanel
        open={draft !== null}
        draft={draft ?? { date, start: "09:00", end: "10:00" }}
        calendars={calendars}
        onClose={() => setDraft(null)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
