// Convertit un événement Google en TimeBlock (la forme utilisée par l'UI).

import type { BlockCategory, TimeBlock } from "@/lib/types";
import type { GoogleEvent } from "./calendar";

const TIME_ZONE = "Europe/Paris";

function hhmm(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(new Date(iso));
}

export type CalendarInfo = {
  googleCalendarId: string;
  label: string;
  category: string;
};

export function toTimeBlock(
  event: GoogleEvent,
  calendar: CalendarInfo,
): TimeBlock | null {
  if (event.status === "cancelled") return null;

  // Un événement "journée entière" a `date` mais pas `dateTime`.
  const allDay = Boolean(event.start.date && !event.start.dateTime);
  const startISO = event.start.dateTime ?? event.start.date;
  const endISO = event.end.dateTime ?? event.end.date;
  if (!startISO || !endISO) return null;

  return {
    id: event.id,
    title: event.summary?.trim() || "(sans titre)",
    category: calendar.category as BlockCategory,
    source: calendar.label,
    calendarId: calendar.googleCalendarId,
    allDay,
    start: allDay ? "" : hhmm(startISO),
    end: allDay ? "" : hhmm(endISO),
    htmlLink: event.htmlLink,
  };
}
