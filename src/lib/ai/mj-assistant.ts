// Assistant business M&J : répond à partir des notes du Mémo.
import { callLLM } from "@/lib/ai/llm";
import { getMjContext } from "@/lib/mj-context";

const SYSTEM = (context: string) => `Tu es l'assistant business de M&J Production
(agence photo/vidéo de Jonael et Malo, à Toulouse).

Tu réponds en t'appuyant EN PRIORITÉ sur les connaissances de l'agence
ci-dessous. Si l'info n'y est pas, tu peux compléter avec du bon sens métier,
mais tu le signales ("hors mémo :").

Style : concret, direct, actionnable. Français. Pas de blabla.
Quand on te demande un texte (message client, section de devis, script
d'appel…), tu le rends prêt à copier, dans le ton de l'agence, sans inventer
de prix, de dates ni d'engagements précis (mets [à préciser] si besoin).

${context}`;

export async function askMjAssistant(opts: {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  const context = await getMjContext();
  const hist = (opts.history ?? [])
    .slice(-4)
    .map(
      (m) =>
        `${m.role === "user" ? "Question précédente" : "Ta réponse précédente"} : ${m.content}`,
    )
    .join("\n\n");

  const user = [
    hist ? `Contexte de la conversation :\n${hist}\n` : "",
    `Demande : ${opts.question.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");

  return callLLM(SYSTEM(context), user, { maxTokens: 2048, temperature: 0.4 });
}
