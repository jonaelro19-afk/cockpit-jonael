// Appel LLM générique, réutilisé hors du contexte « réponse mail ».
// Même logique de fournisseurs que src/lib/ai/reply.ts :
//   1. Google Gemini   — GEMINI_API_KEY   (offre gratuite)
//   2. Anthropic Claude — ANTHROPIC_API_KEY (payant)
// Sans clé : AiProviderError("no-key").

export class AiProviderError extends Error {
  constructor(
    public kind: "no-key" | "api",
    message: string,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

export function hasAiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim(),
  );
}

export function aiProviderLabel(): "gemini" | "claude" | null {
  if (process.env.GEMINI_API_KEY?.trim()) return "gemini";
  if (process.env.ANTHROPIC_API_KEY?.trim()) return "claude";
  return null;
}

type CallOpts = { maxTokens?: number; temperature?: number };

async function askGemini(
  key: string,
  system: string,
  user: string,
  opts: CallOpts,
): Promise<string> {
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          maxOutputTokens: opts.maxTokens ?? 2048,
          temperature: opts.temperature ?? 0.6,
        },
      }),
    },
  );
  if (!res.ok)
    throw new AiProviderError(
      "api",
      `Gemini a répondu ${res.status} : ${(await res.text()).slice(0, 200)}`,
    );
  const data = (await res.json()) as {
    candidates?: {
      content?: { parts?: { text?: string; thought?: boolean }[] };
    }[];
  };
  return (data.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}

async function askClaude(
  key: string,
  system: string,
  user: string,
  opts: CallOpts,
): Promise<string> {
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
      max_tokens: opts.maxTokens ?? 2048,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok)
    throw new AiProviderError(
      "api",
      `Anthropic a répondu ${res.status} : ${(await res.text()).slice(0, 200)}`,
    );
  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  return (data.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("")
    .trim();
}

export async function callLLM(
  system: string,
  user: string,
  opts: CallOpts = {},
): Promise<string> {
  const gemini = process.env.GEMINI_API_KEY?.trim();
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim();
  if (!gemini && !anthropic)
    throw new AiProviderError(
      "no-key",
      "Aucune clé IA configurée (GEMINI_API_KEY ou ANTHROPIC_API_KEY).",
    );

  const text = gemini
    ? await askGemini(gemini, system, user, opts)
    : await askClaude(anthropic!, system, user, opts);
  if (!text) throw new AiProviderError("api", "Réponse vide de l'IA.");
  return text;
}
