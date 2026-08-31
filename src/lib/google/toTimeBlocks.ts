// Convertit un événement Google en TimeBlock (la forme utilisée par l'UI).

import type { BlockCategory, TimeBlock } from "@/lib/types";
import type { GoogleEvent } from "./calendar";

const TIME_ZONE = "Europe/Paris";

const partsFmt = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

// "08:05" (heure locale de Paris) à partir d'un instant ISO.
function hhmm(iso: string): string {
  return partsFmt.format(new Date(iso));
}

// Minutes depuis minuit (Paris) — utilisé pour positionner la boîte sur la grille.
function minutesOfDay(iso: string): number {
  const [h, m] = hhmm(iso).split(":").map(Number);
  return h * 60 + m;
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

  let startMin = 0;
  let endMin = 0;
  if (!allDay) {
    startMin = minutesOfDay(startISO);
    endMin = minutesOfDay(endISO);
    // L'événement déborde sur le lendemain (ou l'API renvoie l'heure du jour
    // suivant) : on borne à la fin de journée pour l'affichage.
    if (endMin <= startMin) endMin = 24 * 60;
  }

  return {
    id: event.id,
    title: event.summary?.trim() || "(sans titre)",
    category: calendar.category as BlockCategory,
    source: calendar.label,
    calendarId: calendar.googleCalendarId,
    allDay,
    start: allDay ? "" : hhmm(startISO),
    end: allDay ? "" : hhmm(endISO),
    startMin,
    endMin,
    htmlLink: event.htmlLink,
  };
}
