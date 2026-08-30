import type { BtsTask } from "@/lib/types";

/*
  Données d'exemple : tâches et devoirs du BTS ATI.
*/
export const btsTasks: BtsTask[] = [
  { id: "b1", title: "Rendre le TP Active Directory", course: "Systèmes", due: "2026-09-02", status: "en cours" },
  { id: "b2", title: "Réviser le modèle OSI", course: "Réseaux", due: "2026-09-04", status: "à faire" },
  { id: "b3", title: "Dossier E4 — première version", course: "Projet", due: "2026-09-12", status: "à faire" },
  { id: "b4", title: "Exercices sous-réseaux (VLSM)", course: "Réseaux", due: "2026-08-29", status: "terminé" },
  { id: "b5", title: "Script PowerShell de sauvegarde", course: "Systèmes", due: "2026-09-08", status: "à faire" },
  { id: "b6", title: "Fiche de révision SQL", course: "Bases de données", due: "2026-09-15", status: "à faire" },
  { id: "b7", title: "Compte rendu TP supervision (Nagios)", course: "Systèmes", due: "2026-08-27", status: "terminé" },
];
