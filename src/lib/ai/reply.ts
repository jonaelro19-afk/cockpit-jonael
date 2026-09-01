// Génère une proposition de réponse à un mail, avec Claude (API Anthropic).
// Nécessite la variable d'environnement ANTHROPIC_API_KEY.

const API = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";

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
- Étudiant en BTS ATI (assistance technique d'ingenieur).
- Cofondateur de M&J Production, une petite agence de photo et de vidéo
  (mariages, clips, contenu pour entreprises, shootings produit).
- Fait aussi de la course a pied, du velo et de la musculation ; est chef scout (SGDF).

Ta mission : rediger une PROPOSITION de reponse au dernier message du fil, que
Jonael va ensuite retravailler avant d'envoyer.

Regles :
- Ecris en francais, a la premiere personne (Jonael).
- Ton professionnel mais chaleureux et direct. Vouvoiement par defaut ;
  tutoiement seulement si l'interlocuteur tutoie clairement.
- Concis : va a l'essentiel, pas de formules pompeuses.
- N'invente JAMAIS un fait, une date, un tarif, une disponibilite ou un
  engagement. Quand une info manque, mets un marqueur clair entre crochets,
  par exemple [date a confirmer] ou [tarif].
- Reprends les questions posees dans le mail et reponds-y point par point si
  besoin.
- Termine par une signature simple : "Bien a vous,\\nJonael — M&J Production"
  (ou "A bientot,\\nJonael" pour un echange informel).
- Rends UNIQUEMENT le corps du mail, rien d'autre (pas d'objet, pas de
  commentaire, pas de "Voici une proposition").`;

export type ThreadMessage = { from: string; date: string; text: string };

export async function suggestReply(opts: {
  subject: string;
  messages: ThreadMessage[];
  instruction?: string; // consigne libre de Jonael ("accepte", "propose mardi"…)
}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key)
    throw new AiError(
      "no-key",
      "ANTHROPIC_API_KEY absente (variables d'environnement).",
    );

  const fil = opts.messages
    .map(
      (m, i) =>
        `--- Message ${i + 1} — de ${m.from} (${m.date}) ---\n${m.text || "(vide)"}`,
    )
    .join("\n\n");

  const userContent = [
    `Objet du fil : ${opts.subject || "(sans objet)"}`,
    "",
    "Fil de discussion (du plus ancien au plus recent) :",
    fil,
    "",
    opts.instruction
      ? `Consigne de Jonael pour cette reponse : ${opts.instruction}`
      : "Redige la reponse de Jonael au dernier message.",
  ].join("\n");

  let res: Response;
  try {
    res = await fetch(API, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        messages: [{ role: "user", content: userContent }],
      }),
    });
  } catch (e) {
    throw new AiError("api", `Appel Anthropic impossible : ${String(e)}`);
  }

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200);
    throw new AiError("api", `Anthropic a repondu ${res.status} : ${detail}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = (data.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("")
    .trim();

  if (!text) throw new AiError("api", "Reponse vide de l'IA.");
  return text;
}
