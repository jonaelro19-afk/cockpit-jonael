/*
  Types partagés dans toute l'application.
  Un "type" décrit la forme d'un objet : quels champs il contient et de quel genre.
  TypeScript s'en sert pour repérer les erreurs avant même d'exécuter le code.
*/

// ---------- Timebox (emploi du temps) ----------

export type BlockCategory = "BTS" | "Sport" | "M&J" | "Perso" | "Pause" | "Cours";

export type TimeBlock = {
  id: string;
  start: string; // heure de début "08:00" (vide si journée entière)
  end: string; // heure de fin "09:30" (vide si journée entière)
  startMin: number; // minutes depuis 00:00 (Paris) — pour placer la boîte sur la grille
  endMin: number; // minutes depuis 00:00 (Paris)
  title: string;
  category: BlockCategory;
  source: string; // nom du calendrier Google d'origine (ROUTINE, SPORT, BTS...)
  allDay: boolean;
  calendarId: string; // id du calendrier Google
  htmlLink?: string; // lien vers l'événement dans Google Agenda
};

// Un calendrier Google dans lequel on peut écrire une nouvelle boîte de temps.
export type TimeboxCalendar = {
  googleCalendarId: string;
  label: string;
  category: BlockCategory;
};

// ---------- BTS ATI (tâches / devoirs) ----------

export type TaskStatus = "à faire" | "en cours" | "terminé";

export type BtsTask = {
  id: string;
  title: string;
  course: string; // matière / module
  due: string; // date d'échéance, format "2026-09-05"
  status: TaskStatus;
};

// ---------- Sport ----------

export type SportType = "Course" | "Vélo" | "Muscu";

export type SportSession = {
  id: string;
  date: string; // "2026-08-28"
  type: SportType;
  durationMin: number; // durée en minutes
  distanceKm?: number; // optionnel (pas de distance pour la muscu) — le "?" veut dire "facultatif"
  feeling: 1 | 2 | 3 | 4 | 5; // ressenti, de 1 (dur) à 5 (au top)
  notes?: string;
};

// ---------- M&J Production ----------

export type ProjectStatus =
  | "Devis"
  | "Confirmé"
  | "Tournage"
  | "Montage"
  | "Livré";

export type MjProject = {
  id: string;
  client: string;
  title: string;
  kind: "Photo" | "Vidéo" | "Photo + Vidéo";
  status: ProjectStatus;
  deadline: string; // "2026-09-20"
  budgetEur: number;
};
