// Assemble les connaissances de l'agence (onglet Mémo M&J) en un bloc de
// texte à injecter dans les prompts IA (assistant, devis, agents…).
import { prisma } from "@/lib/prisma";

const cache: Record<string, { text: string; at: number }> = {};
const TTL = 60_000; // 1 min

// pinnedOnly = version courte (notes épinglées) pour les prompts légers (mails).
export async function getMjContext(
  { pinnedOnly = false }: { pinnedOnly?: boolean } = {},
): Promise<string> {
  const key = pinnedOnly ? "pinned" : "full";
  const hit = cache[key];
  if (hit && Date.now() - hit.at < TTL) return hit.text;

  const notes = await prisma.mjNote.findMany({
    where: pinnedOnly ? { pinned: true } : undefined,
    orderBy: [{ theme: "asc" }, { order: "asc" }],
  });

  if (notes.length === 0) {
    cache[key] = { text: "", at: Date.now() };
    return "";
  }

  const byTheme = new Map<string, string[]>();
  for (const n of notes) {
    const arr = byTheme.get(n.theme) ?? [];
    arr.push(`### ${n.title}\n${n.body}`.trim());
    byTheme.set(n.theme, arr);
  }

  const blocks = [...byTheme.entries()].map(
    ([theme, items]) => `## ${theme}\n\n${items.join("\n\n")}`,
  );

  const text = [
    "CONNAISSANCES DE L'AGENCE M&J PRODUCTION (source de vérité — à utiliser pour toute réponse).",
    "M&J Production = agence photo/vidéo de Jonael et Malo, basée à Toulouse.",
    "",
    blocks.join("\n\n"),
  ].join("\n");

  cache[key] = { text, at: Date.now() };
  return text;
}
