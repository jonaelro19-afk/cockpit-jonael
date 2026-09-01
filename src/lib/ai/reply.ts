// Génère une proposition de réponse à un mail.
// Deux fournisseurs possibles, dans cet ordre :
//   1. Google Gemini  — GEMINI_API_KEY  (offre GRATUITE via aistudio.google.com)
//   2. Anthropic Claude — ANTHROPIC_API_KEY  (payant, ne s'entraîne pas sur les données)
// Si aucune clé n'est présente : erreur "no-key" (le reste de l'app fonctionne).

export class AiError extends Error {
  constructor(
    public kind: "no-key" | "api",
    message: string,
  ) {
    super(message);
    this.name = "AiError";
  }
}

const SYSTEM = `Tu es l'assistant e-mail de Jonael Rodriguez.

Contexte sur Jonael :
- Étudiant en BTS ATI (assistance technique d'ingénieur).
- Cofondateur de M&J Production, une petite agence de photo et de vidéo
  (mariages, clips, contenu pour entreprises, shootings produit).
- Fait aussi de la course à pied, du vélo et de la musculation ; est chef scout (SGDF).

Ta mission : rédiger une PROPOSITION de réponse au dernier message du fil, que
Jonael va ensuite retravailler avant d'envoyer.

Règles :
- Écris en français, à la première personne (Jonael).
- Ton professionnel mais chaleureux et direct. Vouvoiement par défaut ;
  tutoiement seulement si l'interlocuteur tutoie clairement.
- Concis : va à l'essentiel, pas de formules pompeuses.
- N'invente JAMAIS un fait, une date, un tarif, une disponibilité ou un
  engagement. Quand une info manque, mets un marqueur clair entre crochets,
  par exemple [date à confirmer] ou [tarif].
- Reprends les questions posées dans le mail et réponds-y point par point si besoin.
- Termine par une signature simple : "Bien à vous,\\nJonael — M&J Production"
  (ou "À bientôt,\\nJonael" pour un échange informel).
- Rends UNIQUEMENT le corps du mail, rien d'autre (pas d'objet, pas de
  commentaire, pas de "Voici une proposition").`;

export type ThreadMessage = { from: string; date: string; text: string };

function buildUserPrompt(opts: {
  subject: string;
  messages: ThreadMessage[];
  instruction?: string;
}): string {
  const fil = opts.messages
    .map(
      (m, i) =>
        `--- Message ${i + 1} — de ${m.from} (${m.date}) ---\n${m.text || "(vide)"}`,
    )
    .join("\n\n");

  return [
    `Objet du fil : ${opts.subject || "(sans objet)"}`,
    "",
    "Fil de discussion (du plus ancien au plus récent) :",
    fil,
    "",
    opts.instruction
      ? `Consigne de Jonael pour cette réponse : ${opts.instruction}`
      : "Rédige la réponse de Jonael au dernier message.",
  ].join("\n");
}

async function askGemini(key: string, user: string): Promise<string> {
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    },
  );
  if (!res.ok)
    throw new AiError("api", `Gemini a répondu ${res.status} : ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}

async function askClaude(key: string, user: string): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok)
    throw new AiError("api", `Anthropic a répondu ${res.status} : ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (data.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("")
    .trim();
}

export async function suggestReply(opts: {
  subject: string;
  messages: ThreadMessage[];
  instruction?: string;
}): Promise<string> {
  const gemini = process.env.GEMINI_API_KEY?.trim();
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim();
  if (!gemini && !anthropic)
    throw new AiError(
      "no-key",
      "Aucune clé IA configurée (GEMINI_API_KEY ou ANTHROPIC_API_KEY).",
    );

  const user = buildUserPrompt(opts);
  let text = "";
  try {
    text = gemini ? await askGemini(gemini, user) : await askClaude(anthropic!, user);
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError("api", `Appel IA impossible : ${String(e)}`);
  }

  if (!text) throw new AiError("api", "Réponse vide de l'IA.");
  return text;
}
