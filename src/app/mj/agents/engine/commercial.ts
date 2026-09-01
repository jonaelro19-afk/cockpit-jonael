import type { AgentDef, AnalysisContext, PriceGrid } from "./types";
import { OFFRE_DECOUVERTE, REPARTITION_LIGNES } from "./grid";
import { parseBrief, guessPackage, baseAmount } from "./brief";

const QUESTIONS = [
  { key: "client", q: "Qui est le client ? (nom, secteur, taille)" },
  { key: "decideur", q: "Qui décide ? (manager, PDG, office manager)" },
  { key: "event", q: "Type d’événement ? (conférence, gala, lancement, team building)" },
  { key: "public", q: "Public attendu ? (nombre de participants)" },
  { key: "livrables", q: "Livrables ? (format final, durée, destinations)" },
  { key: "budget", q: "Budget client indicatif ?" },
  { key: "deadline", q: "Deadline du livrable ?" },
];

export function missingQuestions(
  brief: string,
  answers: Record<string, string>,
): { key: string; q: string }[] {
  const p = parseBrief(brief, answers);
  const have: Record<string, boolean> = {
    client: !!p.clientName || !!answers.client,
    decideur: !!p.decisionMaker || !!answers.decideur,
    event: !!p.eventType || !!answers.event,
    public: !!p.participants || !!answers.public,
    livrables: !!p.durationMin || !!answers.livrables,
    budget: !!p.budgetHint || !!answers.budget,
    deadline: !!p.deadline || !!answers.deadline,
  };
  return QUESTIONS.filter((x) => !have[x.key]);
}

function buildLines(amount: number, revisions: number) {
  return REPARTITION_LIGNES.map((l) => ({
    label:
      l.label === "Révisions incluses"
        ? `Révisions incluses (${revisions} A/R)`
        : l.label,
    amountEUR: Math.round((amount * l.pct) / 10) * 10,
  }));
}

const commercial: AgentDef = {
  id: "commercial",
  label: "Commercial",
  icon: "Handshake",
  accent: "#f97316",

  outputSchema: {
    package: "string (clé grille)",
    amountEUR: "number",
    lines: "[{ label, amountEUR }]",
    contractMonths: "number|null",
    revisions: "number",
    shootDays: "number",
    grading4K: "boolean",
    missingQuestions: "string[]",
    objections: "[{ objection, answer }]",
  },

  systemPrompt: `Tu es un commercial expert en vidéo corporate à Toulouse / Occitanie, pour M&J Production.
Ton job : qualifier le prospect, produire un devis chiffré justifié, anticiper les objections.

Grille tarifaire M&J (HT) :
- Aftermovie Standard (2–3 min, 1 j tournage) : 900 €
- Aftermovie Premium (4 min, 2 j, interviews) : 1 600 €
- Forfait Photo + Vidéo événement : 1 200–1 800 €
- Contrat social media récurrent : 1 200 €/mois
- B2C restaurant (3 mois) : 750 €/mois
Offre découverte si hésitation : 300 € (B2B) / 150 € (B2C).
Toujours préciser les révisions incluses (2 A/R par défaut).

Dans chaque sections[].body, structure l'info en arborescence (├─ / └─) façon fiche M&J
(ex. "💼 DEVIS COMMERCIAL\\n├─ Montant : ...\\n├─ Contrat : ...\\n└─ Objections : ...").
Réponds UNIQUEMENT par un objet JSON conforme à ce schéma :
{"package": "...", "amountEUR": 0, "lines": [{"label":"...","amountEUR":0}],
 "contractMonths": null, "revisions": 2, "shootDays": 1, "grading4K": true,
 "missingQuestions": ["..."], "objections": [{"objection":"...","answer":"..."}],
 "summary": "une phrase", "sections": [{"title":"...","body":"..."}]}`,

  userTemplate: (ctx: AnalysisContext) =>
    `Brief client :\n${ctx.brief}\n\nRéponses au questionnaire :\n${
      Object.entries(ctx.answers || {})
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n") || "(aucune)"
    }\n\nProduis le devis en JSON.`,

  rules: (ctx: AnalysisContext, grid: PriceGrid) => {
    const p = parseBrief(ctx.brief, ctx.answers);
    const pkg = guessPackage(p);
    const g = grid[pkg];
    const amount =
      p.budgetHint && p.budgetHint >= 500 && p.budgetHint <= 5000
        ? p.budgetHint
        : baseAmount(pkg, p, grid);
    const revisions = g.revisions ?? 2;
    const shootDays = g.shootDays ?? (p.interviews ? 2 : 1);
    const missing = missingQuestions(ctx.brief, ctx.answers).map((x) => x.q);

    const monthly = g.monthly != null;
    const lines = monthly
      ? [{ label: `${g.label} — mensualité`, amountEUR: amount }]
      : buildLines(amount, revisions);

    const objections = [
      {
        objection: "« C’est cher pour une vidéo. »",
        answer: `Comparé à une agence (${amount * 2}–${amount * 3} €), M&J livre le même niveau ciné avec étalonnage S-Log3 et sound design. ${revisions} révisions incluses.`,
      },
      {
        objection: "« On peut faire moins cher ? »",
        answer: `Oui via l’offre découverte à ${p.b2c ? OFFRE_DECOUVERTE.b2c : OFFRE_DECOUVERTE.b2b} € (format court, 1 A/R) pour tester la collaboration.`,
      },
    ];

    const facts = {
      package: pkg,
      amountEUR: amount,
      lines,
      contractMonths: g.contractMonths ?? (p.recurring ? 3 : null),
      revisions,
      shootDays,
      grading4K: true,
      missingQuestions: missing,
      objections,
    };

    return {
      summary: monthly
        ? `${amount} €/mois · ${g.contractMonths ?? 3} mois · ${g.label}`
        : `${amount} € HT · ${g.label} · ${revisions} révisions`,
      facts,
      sections: [
        {
          title: "Devis",
          body:
            lines.map((l) => `├─ ${l.label} — ${l.amountEUR} €`).join("\n") +
            `\n└─ TOTAL ${amount} €${monthly ? "/mois" : " HT"}`,
        },
        {
          title: "Contrat",
          body: facts.contractMonths
            ? `Engagement ${facts.contractMonths} mois.`
            : "Prestation one-shot. Acompte 30 % à la commande.",
        },
        {
          title: "Questions manquantes",
          body: missing.length
            ? missing.map((q) => `? ${q}`).join("\n")
            : "Brief complet ✅",
        },
        {
          title: "Objections probables",
          body: objections
            .map((o) => `├─ ${o.objection}\n└─ ${o.answer}`)
            .join("\n\n"),
        },
      ],
    };
  },
};

export default commercial;
