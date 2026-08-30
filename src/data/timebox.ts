import type { TimeBlock } from "@/lib/types";

/*
  Données d'exemple de secours (fallback), affichées uniquement quand
  Google Agenda n'est pas connecté.
*/
const base = { allDay: false, calendarId: "exemple" };

export const timeBlocks: TimeBlock[] = [
  { ...base, id: "t1", start: "07:00", end: "07:45", title: "Course à pied — 8 km", category: "Sport", source: "exemple" },
  { ...base, id: "t2", start: "08:30", end: "10:30", title: "Cours BTS ATI — Réseaux", category: "BTS", source: "exemple" },
  { ...base, id: "t3", start: "10:30", end: "11:00", title: "Pause café", category: "Pause", source: "exemple" },
  { ...base, id: "t4", start: "11:00", end: "12:30", title: "TP virtualisation", category: "BTS", source: "exemple" },
  { ...base, id: "t5", start: "12:30", end: "13:30", title: "Déjeuner", category: "Pause", source: "exemple" },
  { ...base, id: "t6", start: "14:00", end: "16:00", title: "Montage vidéo — mariage Dupont", category: "M&J", source: "exemple" },
  { ...base, id: "t7", start: "16:00", end: "17:00", title: "Appel client — shooting produit", category: "M&J", source: "exemple" },
  { ...base, id: "t8", start: "18:00", end: "19:00", title: "Révisions — cours de la semaine", category: "BTS", source: "exemple" },
  { ...base, id: "t9", start: "20:30", end: "21:30", title: "Lecture / temps perso", category: "Perso", source: "exemple" },
];
