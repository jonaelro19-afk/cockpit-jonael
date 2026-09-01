// Génère une fiche de révision mise en forme à partir d'un cours brut.
import { callLLM } from "@/lib/ai/llm";
import { ficheKind } from "@/lib/bts-shared";

const SYSTEM = `Tu es professeur en BTS ATI (assistance technique d'ingénieur) et tu
prépares des fiches de révision pour un étudiant, à relire juste avant un
devoir surveillé (DS).

À partir du cours fourni, tu produis une FICHE DE RÉVISION : uniquement
l'essentiel, ce qui tombe aux contrôles, formulé pour être mémorisé vite.

SORTIE : du HTML simple, SANS \`\`\` ni balise <html>/<body>, en utilisant
UNIQUEMENT ces balises et classes (rien d'autre) :

- <h2 class="f-titre">…</h2>        → grande section
- <h3 class="f-soustitre">…</h3>    → sous-partie
- <p>…</p>
- <ul><li>…</li></ul>  et  <ol><li>…</li></ol>
- <span class="f-cle">…</span>      → mot-clé / terme important (ressort en couleur)
- <mark>…</mark>                    → passage à surligner
- <span class="f-def">…</span>      → une définition
- <div class="f-formule">…</div>    → une formule (garde les maths en texte clair, ex : U = R × I)
- <div class="f-retenir"><b>À retenir</b> …</div>  → LE point à ne pas oublier
- <div class="f-exemple">…</div>    → un exemple court
- <table>…</table> avec <tr><th>/<td> → petits tableaux si utile

RÈGLES :
- Français, concis, phrases courtes. Pas d'intro ni de conclusion bavarde.
- Chaque terme important entouré de <span class="f-cle">.
- 1 à 3 blocs <div class="f-retenir"> maximum, pour les points vraiment cruciaux.
- Reste fidèle au cours : n'invente pas de contenu qui n'y est pas.
- Si le cours est court, la fiche est courte. Ne rembourre pas.`;

// Nettoyage défensif : on ne garde que les balises/classes prévues.
const ALLOWED_TAGS = new Set([
  "h2", "h3", "p", "ul", "ol", "li", "span", "mark", "div", "b", "strong",
  "em", "i", "br", "table", "thead", "tbody", "tr", "th", "td", "sup", "sub",
]);
const ALLOWED_CLASSES = new Set([
  "f-titre", "f-soustitre", "f-cle", "f-def", "f-formule", "f-retenir", "f-exemple",
]);

function sanitize(html: string): string {
  let out = html
    .replace(/```html?/gi, "")
    .replace(/```/g, "")
    .replace(/<\/?(script|style|iframe|object|embed|link|meta)[^>]*>/gi, "")
    .replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/ on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");

  // Filtre les balises inconnues + les attributs autres que class (whitelistée).
  out = out.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (m, slash, tag, attrs) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return "";
    if (slash) return `</${t}>`;
    const cls = /class\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? "";
    const keep = cls
      .split(/\s+/)
      .filter((c) => ALLOWED_CLASSES.has(c))
      .join(" ");
    return keep ? `<${t} class="${keep}">` : `<${t}>`;
  });

  return out.trim();
}

export async function generateFiche(opts: {
  title: string;
  kind: string;
  subjectName?: string;
  sourceText: string;
}): Promise<string> {
  const k = ficheKind(opts.kind);
  const user = [
    `Type de fiche demandé : ${k.label}. ${k.brief}`,
    opts.subjectName ? `Matière : ${opts.subjectName}.` : "",
    `Titre de la fiche : ${opts.title}.`,
    "",
    "Cours à mettre en fiche :",
    "-----",
    opts.sourceText.slice(0, 20000),
    "-----",
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await callLLM(SYSTEM, user, { maxTokens: 3072, temperature: 0.4 });
  return sanitize(raw);
}
