import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Fiche from "../Fiche";
import FicheExport from "../FicheExport";
import type { FicheDoc } from "@/lib/fiche-doc";

// Fiche d'exemple 100 % statique — sert à valider le style avant de
// brancher l'IA et l'import de PDF / photos.
const DEMO: FicheDoc = {
  titre: "Le théorème de Pythagore",
  sousTitre: "Triangle rectangle — collège / brevet",
  disposition: "2col",
  colonnes: [
    {
      titre: "Théorème direct",
      blocks: [
        {
          type: "definition",
          terme: "Hypoténuse",
          runs: [
            { t: "le côté opposé à l'angle droit, c'est " },
            { t: "le plus grand côté", hl: "jaune" },
            { t: " du triangle." },
          ],
        },
        {
          type: "paragraphe",
          runs: [
            { t: "Si un triangle est " },
            { t: "rectangle", hl: "jaune" },
            {
              t: ", alors le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.",
            },
          ],
        },
        { type: "formule", texte: "BC² = AB² + AC²" },
        {
          type: "schema",
          kind: "triangle-rectangle",
          etiquettes: { a: "BC (hyp.)", b: "AC", c: "AB" },
          legende: "rectangle en A",
        },
        {
          type: "encadre",
          variante: "astuce",
          runs: [
            { t: "On l'utilise pour " },
            { t: "calculer une longueur", hl: "vert" },
            { t: " quand on connaît les deux autres." },
          ],
        },
        {
          type: "encadre",
          variante: "attention",
          runs: [
            { t: "L'hypoténuse est " },
            { t: "toujours", hl: "jaune" },
            { t: " le plus grand côté. Erreur classique : l'oublier." },
          ],
        },
      ],
    },
    {
      titre: "La réciproque",
      blocks: [
        {
          type: "paragraphe",
          runs: [
            { t: "Si dans un triangle " },
            { t: "BC² = AB² + AC²", cle: true },
            { t: " (BC le plus grand côté), alors le triangle est " },
            { t: "rectangle en A", hl: "vert" },
            { t: "." },
          ],
        },
        {
          type: "schema",
          kind: "etapes",
          etiquettes: { e1: "BC²", e2: "AB² + AC²", e3: "comparer" },
          legende: "les 3 étapes de la réciproque",
        },
        {
          type: "liste",
          ordonnee: true,
          items: [
            [{ t: "Calculer " }, { t: "BC²", cle: true }, { t: " à part." }],
            [
              { t: "Calculer " },
              { t: "AB² + AC²", cle: true },
              { t: " à part." },
            ],
            [
              { t: "Comparer : égaux → " },
              { t: "rectangle", hl: "vert" },
              { t: " ; différents → pas rectangle." },
            ],
          ],
        },
        {
          type: "encadre",
          variante: "retenir",
          runs: [
            { t: "Réciproque = pour " },
            { t: "prouver qu'un angle est droit", hl: "vert" },
            { t: "." },
          ],
        },
      ],
    },
  ],
  note: "Toujours repérer quel côté est l'hypoténuse avant de se lancer.",
};

export default function FicheDemoPage() {
  return (
    <>
      <PageHeader
        title="Fiche d'exemple"
        subtitle="Style à valider — Pythagore (contenu figé, sans IA)"
        action={
          <div className="flex items-center gap-2">
            <FicheExport title={DEMO.titre} />
            <Link
              href="/bts/fiches"
              className="text-sm font-medium text-muted hover:text-text hover:underline"
            >
              ← Retour
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-3xl">
        <Fiche doc={DEMO} />
      </div>

      <p className="mx-auto mt-4 max-w-3xl text-xs text-muted">
        Regarde le rendu (couleurs, police, encadrés, 2 colonnes, le petit
        schéma), teste les boutons <b>Image</b> et <b>PDF</b> en haut, et dis-moi
        ce qu&apos;on ajuste. Ensuite je branche l&apos;IA + l&apos;import de PDF
        / photos.
      </p>
    </>
  );
}
