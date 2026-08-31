// Charge les blocs horaires d'une journée depuis Google Agenda.
// Utilisé par la page Timebox ET par le Dashboard.

import { prisma } from "@/lib/prisma";
import { getGoogleAccessToken } from "@/lib/google/token";
import { listEvents } from "@/lib/google/calendar";
import { toTimeBlock } from "@/lib/google/toTimeBlocks";
import { parisDayRange } from "@/lib/date";
import type { BlockCategory, TimeBlock, TimeboxCalendar } from "@/lib/types";

export type DayResult =
  | { status: "reconnect" }
  | {
      status: "ok";
      timed: TimeBlock[];
      allDay: TimeBlock[];
      failedCount: number;
      calendars: TimeboxCalendar[];
    };

export async function loadDay(
  userId: string,
  date: string,
): Promise<DayResult> {
  const token = await getGoogleAccessToken(userId);
  if (!token.accessToken) return { status: "reconnect" };
  const accessToken = token.accessToken;

  const sources = await prisma.calendarSource.findMany({
    where: { includeInTimebox: true, active: true },
    orderBy: { sortOrder: "asc" },
  });

  const { timeMin, timeMax } = parisDayRange(date);

  const results = await Promise.allSettled(
    sources.map((s) =>
      listEvents({ accessToken, calendarId: s.googleCalendarId, timeMin, timeMax }).then(
        (events) =>
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
      .sort((a, b) => a.startMin - b.startMin),
    calendars: sources.map((s) => ({
      googleCalendarId: s.googleCalendarId,
      label: s.label,
      category: s.category as BlockCategory,
    })),
  };
}
