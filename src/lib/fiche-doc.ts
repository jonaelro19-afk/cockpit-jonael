// Structure d'une fiche de révision visuelle.
// L'IA remplit cet objet ; le composant <Fiche> le met en forme "papier".

export type Highlight = "jaune" | "vert";

// Un morceau de texte, éventuellement mis en valeur.
export type Run = {
  t: string; // le texte
  hl?: Highlight; // surligné jaune (mot-clé/définition) ou vert (résultat clé)
  b?: boolean; // gras
  cle?: boolean; // "mot-clé" → couleur d'accent (bleu)
};

export type SchemaKind =
  | "triangle-rectangle"
  | "repere"
  | "etapes"; // suite de 2 à 4 cases reliées par des flèches

export type Block =
  | { type: "paragraphe"; runs: Run[] }
  | { type: "liste"; items: Run[][]; ordonnee?: boolean }
  | { type: "definition"; terme: string; runs: Run[] }
  | { type: "formule"; texte: string } // ex : "a² = b² + c²"  (peut contenir $...$)
  | {
      type: "encadre";
      variante: "retenir" | "attention" | "astuce";
      runs: Run[];
    }
  | {
      type: "schema";
      kind: SchemaKind;
      etiquettes?: Record<string, string>; // ex : { a: "hypoténuse", b: "5 cm" }
      legende?: string;
    };

export type FicheColumn = {
  titre?: string;
  blocks: Block[];
};

export type FicheDoc = {
  titre: string;
  sousTitre?: string;
  disposition: "1col" | "2col";
  colonnes: FicheColumn[]; // 1 élément si "1col", 2 si "2col"
  note?: string; // petit mot en bas de fiche
};

// Garde-fous : on borne les tailles pour que la fiche tienne sur une feuille.
export function normalizeFiche(doc: FicheDoc): FicheDoc {
  const cols =
    doc.disposition === "2col"
      ? doc.colonnes.slice(0, 2)
      : doc.colonnes.slice(0, 1);
  return {
    ...doc,
    colonnes: cols.map((c) => ({ ...c, blocks: c.blocks.slice(0, 14) })),
  };
}
