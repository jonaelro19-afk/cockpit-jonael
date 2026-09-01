import type { AgentDef, AnalysisContext } from "./types";
import { parseBrief, guessPackage } from "./brief";
import { buildTimeline, fmtDateFR } from "./timeline";

const CHECKLIST = [
  "Repérage site fait (photo + test lumière vidéo)",
  "Contacts sur place confirmés (nom + téléphone)",
  "Équipement chargé (A7S3 + Canon R7 backup)",
  "Son testé (Rode / DJI Mic, niveaux OK)",
  "Storyboard imprimé (référence papier)",
  "Accès site + autorisations confirmés",
  "Contact urgence client (téléphone)",
  "Dossier Google Drive créé (upload rushes)",
  "Alimentation de secours (batteries / groupe si besoin)",
];

const planning: AgentDef = {
  id: "planning",
  label: "Planification",
  icon: "CalendarClock",
  accent: "#38bdf8",

  outputSchema: {
    shootDate: "string|null (ISO)",
    roughCutDue: "string",
    colorDue: "string",
    finalDue: "string",
    turnaroundDays: "number",
    revisionRounds: "number",
    checklist: "[{ label, done:false }]",
    risks: "string[]",
    milestones: "[{ label, date, owner }]",
  },

  systemPrompt: `Tu es production manager chez M&J Production. Tu crées des timelines réalistes en jours ouvrés et des checklists complètes.
Turnaround standard M&J : rough cut +2 j, étalonnage +2 j, sound +1 j, R1 +2 j, R2 +1 j, master +1 j → 8 à 11 j.
Dans chaque sections[].body, structure l'info en arborescence (├─ / └─) façon fiche M&J.
Réponds UNIQUEMENT en JSON :
{"shootDate":"YYYY-MM-DD|null","roughCutDue":"...","colorDue":"...","finalDue":"...",
 "turnaroundDays":9,"revisionRounds":2,"milestones":[{"label":"...","date":"...","owner":"..."}],
 "checklist":[{"label":"...","done":false}],"risks":["..."],
 "summary":"une phrase","sections":[{"title":"...","body":"..."}]}`,

  userTemplate: (ctx: AnalysisContext) =>
    `Brief :\n${ctx.brief}\n\nRéponses :\n${
      Object.entries(ctx.answers || {})
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n") || "(aucune)"
    }\n\nProduis la timeline en JSON. Date de référence si non précisée : ${ctx.refDate}.`,

  rules: (ctx: AnalysisContext) => {
    const p = parseBrief(ctx.brief, ctx.answers);
    const pkg = guessPackage(p);
    const revisionRounds = 2;
    const shootDate = p.shootDate;
    const t = buildTimeline({ shootDate, revisionRounds });

    const risks: string[] = [];
    if (!shootDate) risks.push("Date de tournage absente du brief → timeline non figée.");
    if (p.durationMin && p.durationMin >= 4)
      risks.push("Format ≥ 4 min : prévoir un dérush de sélection plus long.");
    if (p.darkRoom)
      risks.push("Conditions lumière difficiles → repérage lumière indispensable avant J.");
    if (!p.location) risks.push("Lieu non confirmé → bloquer le repérage dès signature.");
    if (pkg === "aftermovie_premium")
      risks.push("Interviews : valider les intervenants et les questions 48 h avant.");

    const checklist = CHECKLIST.map((label) => ({ label, done: false }));

    return {
      summary: shootDate
        ? `Tournage ${fmtDateFR(shootDate)} → livraison ${fmtDateFR(t.finalDue)} (${t.turnaroundDays} j ouvrés)`
        : `Turnaround ${t.turnaroundDays} j ouvrés — date de tournage à confirmer`,
      facts: {
        shootDate,
        roughCutDue: t.roughCutDue,
        colorDue: t.colorDue,
        finalDue: t.finalDue,
        turnaroundDays: t.turnaroundDays,
        revisionRounds,
        milestones: t.milestones,
        checklist,
        risks,
      },
      sections: [
        {
          title: "Timeline (jours ouvrés)",
          body: t.milestones.length
            ? t.milestones
                .map((m) => `├─ ${fmtDateFR(m.date)} — ${m.label}  ·  ${m.owner}`)
                .join("\n")
            : "Renseigner une date de tournage pour générer les jalons.",
        },
        {
          title: "Jalons clés",
          body: `├─ Rough cut dû : ${fmtDateFR(t.roughCutDue)}\n├─ Étalonnage dû : ${fmtDateFR(t.colorDue)}\n└─ Master final dû : ${fmtDateFR(t.finalDue)}`,
        },
        {
          title: "Checklist pré-tournage (Malo)",
          body: checklist.map((c) => `☐ ${c.label}`).join("\n"),
        },
        {
          title: "Risques",
          body: risks.length
            ? risks.map((r) => `⚠ ${r}`).join("\n")
            : "Aucun risque majeur identifié.",
        },
      ],
    };
  },
};

export default planning;
