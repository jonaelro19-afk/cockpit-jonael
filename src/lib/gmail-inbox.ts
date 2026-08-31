// Charge la boîte de réception triée pour un utilisateur.
// Rassemble : jeton Google + mots-clés "important" (M&J, clients) + tri.

import { prisma } from "@/lib/prisma";
import { getGoogleAccessToken } from "@/lib/google/token";
import { listInbox, type InboxResult } from "@/lib/google/gmail";

export type LoadInboxResult =
  | { ok: false; reason: "reconnect" }
  | InboxResult;

export async function loadInbox(userId: string): Promise<LoadInboxResult> {
  const token = await getGoogleAccessToken(userId);
  if (!token.accessToken) return { ok: false, reason: "reconnect" };

  // Noms de clients & sociétés M&J → un mail qui les mentionne est important.
  const clients = await prisma.client.findMany({
    select: { name: true, company: true },
  });
  const boostKeywords = clients
    .flatMap((c) => [c.name, c.company ?? ""])
    .map((s) => s.trim())
    .filter((s) => s.length >= 4);

  return listInbox({ accessToken: token.accessToken, max: 60, boostKeywords });
}
