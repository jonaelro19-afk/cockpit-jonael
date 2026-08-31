import type { TimeBlock } from "@/lib/types";
import { toMinutes } from "@/lib/timebox-shared";
import { todayInParis } from "@/lib/date";

/*
  Données d'exemple de secours (fallback), affichées uniquement quand
  Google Agenda n'est pas connecté.
*/
type Raw = Omit<
  TimeBlock,
  "allDay" | "calendarId" | "startMin" | "endMin" | "date"
>;

const raw: Raw[] = [
  { id: "t1", start: "07:00", end: "07:45", title: "Course à pied — 8 km", category: "Sport", source: "exemple" },
  { id: "t2", start: "08:30", end: "10:30", title: "Cours BTS ATI — Réseaux", category: "BTS", source: "exemple" },
  { id: "t3", start: "10:30", end: "11:00", title: "Pause café", category: "Pause", source: "exemple" },
  { id: "t4", start: "11:00", end: "12:30", title: "TP virtualisation", category: "BTS", source: "exemple" },
  { id: "t5", start: "12:30", end: "13:30", title: "Déjeuner", category: "Pause", source: "exemple" },
  { id: "t6", start: "14:00", end: "16:00", title: "Montage vidéo — mariage Dupont", category: "M&J", source: "exemple" },
  { id: "t7", start: "16:00", end: "17:00", title: "Appel client — shooting produit", category: "M&J", source: "exemple" },
  { id: "t8", start: "18:00", end: "19:00", title: "Révisions — cours de la semaine", category: "BTS", source: "exemple" },
  { id: "t9", start: "20:30", end: "21:30", title: "Lecture / temps perso", category: "Perso", source: "exemple" },
];

export const timeBlocks: TimeBlock[] = raw.map((b) => ({
  ...b,
  date: todayInParis(),
  allDay: false,
  calendarId: "exemple",
  startMin: toMinutes(b.start),
  endMin: toMinutes(b.end),
}));
