import type { SportSession } from "@/lib/types";

/*
  Données d'exemple : séances de sport récentes.
  Plus tard : synchronisation avec Strava.
*/
export const sportSessions: SportSession[] = [
  { id: "s1", date: "2026-08-30", type: "Course", durationMin: 42, distanceKm: 8.1, feeling: 4, notes: "Sortie matinale, jambes légères" },
  { id: "s2", date: "2026-08-28", type: "Muscu", durationMin: 55, feeling: 3, notes: "Haut du corps" },
  { id: "s3", date: "2026-08-27", type: "Vélo", durationMin: 90, distanceKm: 34.5, feeling: 5, notes: "Boucle collines" },
  { id: "s4", date: "2026-08-25", type: "Course", durationMin: 30, distanceKm: 5.4, feeling: 2, notes: "Fractionné, dur" },
  { id: "s5", date: "2026-08-24", type: "Muscu", durationMin: 50, feeling: 4, notes: "Jambes" },
  { id: "s6", date: "2026-08-22", type: "Vélo", durationMin: 65, distanceKm: 24.0, feeling: 3 },
  { id: "s7", date: "2026-08-20", type: "Course", durationMin: 48, distanceKm: 9.2, feeling: 4, notes: "Allure endurance" },
];
