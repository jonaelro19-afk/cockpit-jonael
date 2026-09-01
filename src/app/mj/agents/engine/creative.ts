import type { AgentDef, AnalysisContext } from "./types";
import { parseBrief } from "./brief";

const MOODBOARDS: Record<string, string[]> = {
  gala: [
    "The Social Network (tons froids, prestige)",
    "clips corporate Apple Events (rythme posé)",
    "aftermovies Cannes Lions (montage musical)",
  ],
  "conférence": [
    "documentaires TED (interviews cadrées)",
    'Nike "Dream Crazy" (voix off + montage)',
    "keynotes Figma Config",
  ],
  "lancement produit": [
    "pubs Aesop (lumière douce)",
    "films Leica (grain ciné)",
    "teasers A24",
  ],
  "team building": [
    'Patagonia "outdoor" (naturel)',
    "clips Airbnb (chaleur humaine)",
    "vlogs Kinfolk",
  ],
  mariage: [
    "films Tyler Shields (lumière chaude)",
    "clips The White Company",
    "courts-métrages Vimeo Wedding Staff Picks",
  ],
  default: [
    "aftermovies Musicbed (S-Log3 authentique)",
    "films corporate Territory Studio",
    "documentaires courts Vimeo Staff Picks",
  ],
};

const creative: AgentDef = {
  id: "creative",
  label: "Créatif",
  icon: "Clapperboard",
  accent: "#a78bfa",

  outputSchema: {
    acts: "[{ act:1|2|3, window, shots:string[] }]",
    moodboard: "string[3]",
    music: "[{ title, source, timing }]",
    trendsApplied: "string[]",
    assetsToCreate: "string[]",
  },

  systemPrompt: `Tu es directeur créatif chez M&J Production. Tu proposes des storyboards singuliers (jamais cliché), une direction cinématique, et tu appliques la signature M&J : cinéma vrai (S-Log3, pas sur-saturé), interviews naturelles, sound design fort, montage au rythme juste, colorimétrie Rec.709 cohérente (pas de LUT cheesy).
Structure toujours en 3 actes avec timings et 3–5 plans PRÉCIS par acte (pas génériques).
Dans chaque sections[].body, structure l'info en arborescence (├─ / └─) façon fiche M&J.
Réponds UNIQUEMENT en JSON :
{"acts":[{"act":1,"window":"0–30s","shots":["..."]}],
 "moodboard":["film 1","film 2","film 3"],
 "music":[{"title":"...","source":"Musicbed/Artlist","timing":"..."}],
 "trendsApplied":["..."],"assetsToCreate":["..."],
 "summary":"une phrase","sections":[{"title":"...","body":"..."}]}`,

  userTemplate: (ctx: AnalysisContext) =>
    `Brief :\n${ctx.brief}\n\nRéponses :\n${
      Object.entries(ctx.answers || {})
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n") || "(aucune)"
    }\n\nProduis la direction créative en JSON.`,

  rules: (ctx: AnalysisContext) => {
    const p = parseBrief(ctx.brief, ctx.answers);
    const dur = p.durationMin || 4;
    const totalSec = Math.round(dur * 60);
    const a1End = Math.round(totalSec * 0.15);
    const a2End = Math.round(totalSec * 0.7);
    const fmt = (s: number) =>
      s >= 60 ? `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}` : `${s}s`;
    const mood = MOODBOARDS[p.eventType ?? "default"] || MOODBOARDS.default;

    const acts = [
      {
        act: 1,
        window: `0–${fmt(a1End)}`,
        shots: [
          p.mentionsDrone
            ? "Drone orbital lent sur le lieu à l’heure bleue"
            : "Plan large d’ouverture du lieu, lumière naturelle",
          "Détails texture : accueil, badges, mains qui se serrent (cut serré)",
          `Premier regard ${p.eventType || "invités"} — amorce de curiosité, pas de logo tout de suite`,
        ],
      },
      {
        act: 2,
        window: `${fmt(a1End)}–${fmt(a2End)}`,
        shots: [
          p.interviews
            ? "Interview intervenant clé, cadre 3/4, lumière fenêtre douce"
            : "Prise de parole captée en pied + gros plan réaction",
          "B-roll networking : conversations, rires, échanges de cartes",
          "Plan signature : traveling latéral à hauteur d’épaule dans la foule",
          "Insert produit / scénographie si pertinent",
        ],
      },
      {
        act: 3,
        window: `${fmt(a2End)}–${fmt(totalSec)}`,
        shots: [
          "Climax : toast / applaudissements / photo de groupe",
          "Ralenti maîtrisé (50p) sur un moment d’émotion vraie",
          "Outro : logo client incrusté sobrement + CTA",
        ],
      },
    ];

    const music = [
      {
        title: "Piste cinématique organique (house feutrée)",
        source: "Musicbed",
        timing: `Sombre 0–${Math.round(dur * 0.25)}m, progressif jusqu’à ${Math.round(dur * 0.75)}m, apothéose fin`,
      },
      {
        title: "Alternative piano + nappes",
        source: "Artlist",
        timing: "Option si tonalité plus intime souhaitée",
      },
    ];

    const assets = [
      "Titres incrustés (intervenant, société, enjeu)",
      "Écran outro avec CTA client",
      "Transitions cuts francs (pas de dissolves gratuits)",
    ];
    if (p.durationMin && p.durationMin >= 4)
      assets.unshift("Générique d’ouverture court (5–8s)");

    const trends = [
      "Cinéma vrai (S-Log3, grading authentique)",
      "Interviews naturelles (pas face caméra raide)",
      "Sound design en avant (voix + musique + ambiance)",
      "Rythme de montage juste (pas frénétique par défaut)",
    ];

    return {
      summary: `Storyboard 3 actes · réf. « ${mood[0].split(" (")[0]} » · musique ${music[0].source}`,
      facts: {
        acts,
        moodboard: mood,
        music,
        trendsApplied: trends,
        assetsToCreate: assets,
      },
      sections: [
        ...acts.map((a) => ({
          title: `Acte ${a.act} (${a.window})`,
          body: a.shots.map((s) => `├─ ${s}`).join("\n"),
        })),
        { title: "Moodboard", body: mood.map((m) => `├─ ${m}`).join("\n") },
        {
          title: "Musique",
          body: music.map((m) => `├─ ${m.title} (${m.source})\n│  ${m.timing}`).join("\n"),
        },
        {
          title: "Signature M&J appliquée",
          body: trends.map((x) => `✓ ${x}`).join("\n"),
        },
        {
          title: "Assets à créer",
          body: assets.map((x) => `├─ ${x}`).join("\n"),
        },
      ],
    };
  },
};

export default creative;
