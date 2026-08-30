/*
  Petites fonctions utilitaires réutilisables.
*/

// Transforme "2026-09-05" en "5 sept. 2026" (français).
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Nombre de jours entre aujourd'hui et une date (négatif = déjà passé).
export function daysUntil(iso: string): number {
  const oneDay = 1000 * 60 * 60 * 24;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / oneDay);
}
