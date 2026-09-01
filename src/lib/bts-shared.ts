// Constantes BTS sans dépendance à la base — importables côté client.

export type FicheKind = {
  id: string;
  label: string;
  hint: string; // aide affichée sous le choix
  brief: string; // consigne envoyée à l'IA
};

export const FICHE_KINDS: FicheKind[] = [
  {
    id: "Synthèse",
    label: "Synthèse",
    hint: "Vue d'ensemble structurée du chapitre",
    brief:
      "Fais une synthèse structurée : les grandes idées, hiérarchisées, avec les points clés. Couvre tout le cours mais va à l'essentiel.",
  },
  {
    id: "Définitions clés",
    label: "Définitions clés",
    hint: "Les termes à connaître par cœur",
    brief:
      "Liste les définitions importantes du cours, une par une, formulées de façon précise et mémorisable (terme en couleur, définition juste après).",
  },
  {
    id: "Formules & lois",
    label: "Formules & lois",
    hint: "Toutes les formules, unités, quand les utiliser",
    brief:
      "Recense toutes les formules et lois : chaque formule encadrée, avec la signification de chaque symbole, les unités, et dans quel cas l'utiliser.",
  },
  {
    id: "Méthode",
    label: "Méthode / démarche",
    hint: "Les étapes d'une résolution type",
    brief:
      "Décris la ou les méthodes de résolution vues dans le cours, sous forme d'étapes numérotées, avec les pièges à éviter.",
  },
  {
    id: "Schéma commenté",
    label: "Schéma commenté",
    hint: "Un montage / schéma et ses annotations",
    brief:
      "Décris le(s) schéma(s) ou montage(s) du cours : rôle de chaque élément, sens des grandeurs, annotations importantes. Utilise des listes claires (pas d'image).",
  },
  {
    id: "Dates & repères",
    label: "Dates & repères",
    hint: "Chronologie, valeurs de référence",
    brief:
      "Extrais les repères à mémoriser : dates, ordres de grandeur, valeurs de référence, normes. Présente-les en liste ou petit tableau.",
  },
  {
    id: "Quiz",
    label: "Quiz (Q/R)",
    hint: "Questions-réponses pour s'auto-tester",
    brief:
      "Transforme le cours en 8 à 15 questions courtes avec leur réponse. Mets la question en gras, la réponse juste en dessous.",
  },
];

export function ficheKind(id: string): FicheKind {
  return FICHE_KINDS.find((k) => k.id === id) ?? FICHE_KINDS[0];
}
