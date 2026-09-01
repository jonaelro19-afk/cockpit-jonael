import type { AgentDef, AnalysisContext } from "./types";
import { parseBrief } from "./brief";

const RESOLVE_WORKFLOW = [
  "Import rushes A7S3 (XAVC S-I) + création proxies HD pour la timeline",
  "Assembly / rough cut (structure narrative)",
  "Offline edit validé → conform online plein-résolution",
  "Étalonnage : S-Log3 → Rec.709 (LUT Blackmagic + courbes)",
  "Sound design Fairlight (dialogue, musique, ambiance)",
  "Export master ProRes 422 HQ + déclinaisons diffusion",
];

const BASE_EXPORTS = [
  { target: "Master archival", spec: "ProRes 422 HQ 4K" },
  { target: "LinkedIn", spec: "H.264 MP4 1080p 8–12 Mbps" },
  { target: "Site web", spec: "H.264 MP4 1080p 6–8 Mbps" },
];

const editing: AgentDef = {
  id: "editing",
  label: "Montage",
  icon: "Film",
  accent: "#f43f5e",

  outputSchema: {
    camera: "string",
    shootFormat: "string",
    picStyle: "string",
    iso: "string",
    resolveWorkflow: "string[]",
    grading: "string",
    exports: "[{ target, spec }]",
    techAlerts: "string[]",
    minPostDays: "number",
  },

  systemPrompt: `Tu es monteur / coloriste expert DaVinci Resolve et Sony A7S3 chez M&J Production.
Réglages tournage de référence : 4K 25p full-frame, XAVC S-I 4:2:2 10-bit, Picture Profile PP8 (S-Log3 / S-Gamut3.Cine), ISO natifs 640 ou 12800 uniquement, objectif 24-70 GM2. Canon R7 en backup ultra-grand-angle.
Grading signature M&J : LUT S-Log3→Rec.709, +highlights / -shadows léger, saturation modérée, contraste subtil, vignette discrète.
Dans chaque sections[].body, structure l'info en arborescence (├─ / └─) façon fiche M&J.
Réponds UNIQUEMENT en JSON :
{"camera":"A7S3","shootFormat":"4K 25p XAVC S-I 4:2:2 10-bit","picStyle":"PP8 S-Log3","iso":"640 / 12800 natifs",
 "resolveWorkflow":["..."],"grading":"...","exports":[{"target":"...","spec":"..."}],
 "techAlerts":["..."],"minPostDays":6,
 "summary":"une phrase","sections":[{"title":"...","body":"..."}]}`,

  userTemplate: (ctx: AnalysisContext) =>
    `Brief :\n${ctx.brief}\n\nRéponses :\n${
      Object.entries(ctx.answers || {})
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n") || "(aucune)"
    }\n\nProduis les conseils post-prod en JSON.`,

  rules: (ctx: AnalysisContext) => {
    const p = parseBrief(ctx.brief, ctx.answers);
    const low = p.text.toLowerCase();
    const camera =
      p.mentionsDrone || /grand angle|large/.test(low) ? "A7S3+R7" : "A7S3";

    const exports = [...BASE_EXPORTS];
    if (p.channelHint === "YouTube" || /youtube/i.test(p.text)) {
      exports.splice(1, 0, { target: "YouTube", spec: "H.264 MP4 4K 15–20 Mbps" });
    }
    if (p.channelHint === "Instagram" || /instagram|reels|tiktok/i.test(p.text)) {
      exports.push({
        target: "Instagram/Reels",
        spec: "MP4 1080×1920 8 Mbps, < 30s hook",
      });
    }

    const alerts: string[] = [];
    if (p.darkRoom)
      alerts.push(
        "Salle sombre → ISO 12800 natif + lumières Aputure Amaran, éviter les ISO intermédiaires.",
      );
    if (p.gimbal)
      alerts.push(
        "Gimbal sans gyro embarqué A7S3 → stabilisation via Resolve Tracker (pas Gyroflow).",
      );
    if (p.interviews)
      alerts.push("Interviews multi-caméra → sync par audio dans Resolve (multicam).");
    alerts.push("Relink offline → « Relink Selected Clips », jamais « Replace ».");

    const minPostDays =
      p.interviews || (p.durationMin && p.durationMin >= 4) ? 7 : 5;

    return {
      summary: `${camera} · 4K 25p PP8 S-Log3 · grading M&J · master ProRes 422 HQ`,
      facts: {
        camera,
        shootFormat: "4K 25p XAVC S-I 4:2:2 10-bit",
        picStyle: "PP8 S-Log3 / S-Gamut3.Cine",
        iso: "ISO natifs 640 ou 12800 uniquement",
        resolveWorkflow: RESOLVE_WORKFLOW,
        grading:
          "LUT S-Log3→Rec.709 + courbes (+highlights / -shadows), saturation modérée, contraste subtil, vignette discrète.",
        exports,
        techAlerts: alerts,
        minPostDays,
      },
      sections: [
        {
          title: "Réglages tournage (A7S3)",
          body: `├─ Format : 4K 25p XAVC S-I 4:2:2 10-bit\n├─ Profil : PP8 (S-Log3 / S-Gamut3.Cine)\n├─ ISO : 640 ou 12800 natifs uniquement\n└─ Objectif : 24-70 GM2${camera === "A7S3+R7" ? " + Canon R7 (ultra grand-angle)" : ""}`,
        },
        {
          title: "Workflow DaVinci Resolve",
          body: RESOLVE_WORKFLOW.map((s, i) => `${i + 1}. ${s}`).join("\n"),
        },
        {
          title: "Grading signature M&J",
          body: "LUT S-Log3→Rec.709 + courbes douces (+highlights / -shadows), saturation modérée, contraste subtil, vignette discrète.",
        },
        {
          title: "Alertes techniques",
          body: alerts.map((a) => `⚠ ${a}`).join("\n"),
        },
        {
          title: "Exports",
          body: exports.map((e) => `├─ ${e.target} — ${e.spec}`).join("\n"),
        },
      ],
    };
  },
};

export default editing;
