import type { MjProject } from "@/lib/types";

/*
  Données d'exemple : projets clients de M&J Production (agence photo/vidéo).
*/
export const mjProjects: MjProject[] = [
  { id: "m1", client: "Dupont", title: "Film de mariage", kind: "Vidéo", status: "Montage", deadline: "2026-09-10", budgetEur: 1800 },
  { id: "m2", client: "Café Lumière", title: "Shooting produits — carte d'automne", kind: "Photo", status: "Confirmé", deadline: "2026-09-06", budgetEur: 650 },
  { id: "m3", client: "Startup Nova", title: "Vidéo de présentation + portraits équipe", kind: "Photo + Vidéo", status: "Devis", deadline: "2026-09-25", budgetEur: 2400 },
  { id: "m4", client: "Association Cyclo", title: "Couverture course locale", kind: "Photo", status: "Livré", deadline: "2026-08-18", budgetEur: 400 },
  { id: "m5", client: "Restaurant Le Cèdre", title: "Reels réseaux sociaux (x4)", kind: "Vidéo", status: "Tournage", deadline: "2026-09-14", budgetEur: 900 },
];
