import type { AgentDef, AnalysisContext } from "./types";
import { parseBrief } from "./brief";

const POSITIONINGS: Record<string, string[]> = {
  gala: [
    "Réseau premium, entre-soi choisi",
    "Prestige accessible, pas guindé",
    "Excellence collective mise en lumière",
  ],
  "conférence": [
    "Thought leadership et innovation",
    "FOMO : « il fallait y être »",
    "Expertise partagée, communauté vivante",
  ],
  "lancement produit": [
    "Rupture maîtrisée",
    "Le produit comme évidence",
    "Vision d’équipe incarnée",
  ],
  "team building": [
    "Culture d’entreprise vécue",
    "Cohésion réelle, pas posée",
    "Marque employeur crédible",
  ],
  default: [
    "Savoir-faire local, ambition large",
    "Preuve par l’image",
    "Marque vivante et humaine",
  ],
};

function cap(s: string | null): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

const marketing: AgentDef = {
  id: "marketing",
  label: "Marketing",
  icon: "Megaphone",
  accent: "#34d399",

  outputSchema: {
    positioning: "string",
    positioningVariants: "string[3]",
    primaryChannel: "LinkedIn|YouTube|Website|Internal|Instagram",
    secondaryChannels: "string[]",
    linkedinCaption: "string",
    hashtags: "string[]",
    postTiming: "string",
    cta: "string",
  },

  systemPrompt: `Tu es stratégiste marketing digital pour M&J Production. Ton job : positionnement client, stratégie de diffusion, social media.
Repères : LinkedIn B2B → mardi/jeudi 8–9h ; publier 3 jours après l’événement (buzz chaud) ; 5–10 hashtags max (mix génériques + niche + locaux type #Toulouse).
Dans chaque sections[].body, structure l'info en arborescence (├─ / └─) façon fiche M&J.
Réponds UNIQUEMENT en JSON :
{"positioning":"...","positioningVariants":["...","...","..."],
 "primaryChannel":"LinkedIn","secondaryChannels":["..."],
 "linkedinCaption":"...","hashtags":["#..."],"postTiming":"...","cta":"...",
 "summary":"une phrase","sections":[{"title":"...","body":"..."}]}`,

  userTemplate: (ctx: AnalysisContext) =>
    `Brief :\n${ctx.brief}\n\nRéponses :\n${
      Object.entries(ctx.answers || {})
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n") || "(aucune)"
    }\n\nProduis la stratégie marketing en JSON.`,

  rules: (ctx: AnalysisContext) => {
    const p = parseBrief(ctx.brief, ctx.answers);
    const variants = POSITIONINGS[p.eventType ?? "default"] || POSITIONINGS.default;
    const primary = p.channelHint || (p.b2c ? "Instagram" : "LinkedIn");
    const secondary =
      primary === "LinkedIn"
        ? ["YouTube (version longue)", "Email post-événement"]
        : ["LinkedIn", "Email"];

    const client = p.clientName || "le client";
    const evt = p.eventType || "l’événement";
    const city = /toulouse/i.test(p.text) ? "Toulouse" : "Occitanie";

    const caption = `🎬 ${client} — ${cap(evt)} : les moments clés\n\nRetour en images sur un temps fort ${p.participants ? `réunissant ${p.participants} participants` : ""}. Énergie, échanges, et une ambiance qui dit tout de ${client}.\n\n👉 Prochaine édition : restez connectés.\n\n#${city} #Événementiel #VidéoCorporate`;

    const hashtags = [
      `#${city}`,
      "#Événementiel",
      "#VidéoCorporate",
      p.eventType ? `#${cap(p.eventType).replace(/\s/g, "")}` : "#Entreprise",
      "#MJProduction",
    ];

    return {
      summary: `${primary} · positionnement « ${variants[0]} » · post J+3 ${primary === "LinkedIn" ? "mardi 8–9h" : "18–20h"}`,
      facts: {
        positioning: variants[0],
        positioningVariants: variants,
        primaryChannel: primary,
        secondaryChannels: secondary,
        linkedinCaption: caption,
        hashtags,
        postTiming:
          primary === "LinkedIn"
            ? "Mardi ou jeudi, 8–9h, 3 jours après l’événement"
            : "Mar–jeu 18–20h, 2–3 jours après",
        cta:
          p.eventType === "conférence"
            ? "S’inscrire à la prochaine édition"
            : "Découvrir / nous contacter",
      },
      sections: [
        {
          title: "Positionnement",
          body: `├─ Retenu : « ${variants[0]} »\n${variants
            .slice(1)
            .map((v) => `├─ Variante : ${v}`)
            .join("\n")}`,
        },
        {
          title: "Canaux",
          body: `├─ Principal : ${primary}\n└─ Secondaires : ${secondary.join(", ")}`,
        },
        { title: "Post LinkedIn (template)", body: caption },
        { title: "Hashtags", body: hashtags.join("  ") },
        {
          title: "Timing & CTA",
          body: `├─ ${primary === "LinkedIn" ? "Mardi/jeudi 8–9h, J+3." : "Mar–jeu 18–20h, J+2/3."}\n└─ CTA : ${p.eventType === "conférence" ? "inscription prochaine édition" : "contact / découverte"}`,
        },
      ],
    };
  },
};

export default marketing;
