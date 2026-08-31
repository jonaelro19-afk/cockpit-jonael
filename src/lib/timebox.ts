// Charge les blocs horaires depuis Google Agenda.
// Utilisé par la page Timebox (jour / semaine / mois / année) ET par le Dashboard.

import { prisma } from "@/lib/prisma";
import { getGoogleAccessToken } from "@/lib/google/token";
import { listEvents } from "@/lib/google/calendar";
import { toTimeBlock } from "@/lib/google/toTimeBlocks";
import { parisDayRange } from "@/lib/date";
import type { BlockCategory, TimeBlock, TimeboxCalendar } from "@/lib/types";

export type RangeResult =
  | { status: "reconnect" }
  | {
      status: "ok";
      timed: TimeBlock[];
      allDay: TimeBlock[];
      failedCount: number;
      calendars: TimeboxCalendar[];
    };

// Alias historique (le Dashboard l'importe).
export type DayResult = RangeResult;

// Charge les événements entre deux dates "AAAA-MM-JJ" incluses.
export async function loadRange(
  userId: string,
  startDate: string,
  endDate: string,
  opts: { maxPages?: number } = {},
): Promise<RangeResult> {
  const token = await getGoogleAccessToken(userId);
  if (!token.accessToken) return { status: "reconnect" };
  const accessToken = token.accessToken;

  const sources = await prisma.calendarSource.findMany({
    where: { includeInTimebox: true, active: true },
    orderBy: { sortOrder: "asc" },
  });

  const { timeMin } = parisDayRange(startDate);
  const { timeMax } = parisDayRange(endDate);

  const results = await Promise.allSettled(
    sources.map((s) =>
      listEvents({
        accessToken,
        calendarId: s.googleCalendarId,
        timeMin,
        timeMax,
        maxPages: opts.maxPages ?? 1,
      }).then((events) =>
        events
          .map((e) =>
            toTimeBlock(e, {
              googleCalendarId: s.googleCalendarId,
              label: s.label,
              category: s.category,
            }),
          )
          .filter((b): b is TimeBlock => b !== null),
      ),
    ),
  );

  const blocks = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : [],
  );

  return {
    status: "ok",
    failedCount: results.filter((r) => r.status === "rejected").length,
    allDay: blocks.filter((b) => b.allDay),
    timed: blocks
      .filter((b) => !b.allDay)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startMin - b.startMin),
    calendars: sources.map((s) => ({
      googleCalendarId: s.googleCalendarId,
      label: s.label,
      category: s.category as BlockCategory,
    })),
  };
}

// Une seule journée (raccourci).
export function loadDay(userId: string, date: string): Promise<RangeResult> {
  return loadRange(userId, date, date);
}
