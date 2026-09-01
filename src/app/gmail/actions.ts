"use server";
// Actions du module Gmail : archivage + réponse assistée par IA.

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getGoogleAccessToken } from "@/lib/google/token";
import {
  archiveMessages,
  getThreadForReply,
  replyToThread,
  GmailWriteError,
  type Bucket,
  type SendMode,
} from "@/lib/google/gmail";
import { suggestReply, AiError } from "@/lib/ai/reply";
import { loadInbox } from "@/lib/gmail-inbox";
import { getMjContext } from "@/lib/mj-context";

async function sessionOrThrow() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

async function tokenOrThrow() {
  const user = await sessionOrThrow();
  const t = await getGoogleAccessToken(user.id);
  if (!t.accessToken) throw new Error("Accès Google indisponible");
  return t.accessToken;
}

export async function archiveMail(id: string) {
  const accessToken = await tokenOrThrow();
  await archiveMessages({ accessToken, ids: [id] });
  revalidatePath("/gmail");
  revalidatePath("/");
}

// Archive tout un panier ("bruit" ou "avoir").
export async function archiveBucket(bucket: Bucket) {
  const user = await sessionOrThrow();
  const [accessToken, inbox] = await Promise.all([
    tokenOrThrow(),
    loadInbox(user.id),
  ]);
  if (!inbox.ok) return;
  const ids = inbox.mails.filter((m) => m.bucket === bucket).map((m) => m.id);
  await archiveMessages({ accessToken, ids });
  revalidatePath("/gmail");
  revalidatePath("/");
}

// ── Réponse assistée par IA ───────────────────────────────────────

export type SuggestState =
  | { ok: true; text: string }
  | { ok: false; error: string; kind?: "no-key" | "api" };

export async function suggestReplyAction(
  threadId: string,
  instruction?: string,
): Promise<SuggestState> {
  try {
    const accessToken = await tokenOrThrow();
    const [thread, businessContext] = await Promise.all([
      getThreadForReply({ accessToken, threadId }),
      getMjContext({ pinnedOnly: true }).catch(() => ""),
    ]);
    const text = await suggestReply({
      subject: thread.subject,
      messages: thread.messages,
      instruction: instruction?.trim() || undefined,
      businessContext: businessContext || undefined,
    });
    return { ok: true, text };
  } catch (err) {
    if (err instanceof AiError)
      return {
        ok: false,
        kind: err.kind,
        error:
          err.kind === "no-key"
            ? "L'IA n'est pas encore configurée : ajoute GEMINI_API_KEY (gratuit) sur Vercel."
            : `L'IA n'a pas pu répondre : ${err.message}`,
      };
    console.error("suggestReplyAction", err);
    return { ok: false, error: "Impossible de générer une proposition." };
  }
}

export type SendReplyState = { ok: true; mode: SendMode } | { ok: false; error: string };

export async function sendReplyAction(input: {
  threadId: string;
  body: string;
  mode: SendMode;
}): Promise<SendReplyState> {
  const body = input.body.trim();
  if (!body) return { ok: false, error: "La réponse est vide." };

  try {
    const user = await sessionOrThrow();
    const accessToken = await tokenOrThrow();
    const thread = await getThreadForReply({
      accessToken,
      threadId: input.threadId,
    });
    if (!thread.replyTo)
      return { ok: false, error: "Impossible de retrouver le destinataire." };

    await replyToThread({
      accessToken,
      mode: input.mode,
      threadId: input.threadId,
      fromName: user.name ?? "Jonael",
      fromEmail: user.email ?? "",
      to: thread.replyTo,
      subject: thread.subject,
      inReplyTo: thread.lastMessageIdHeader,
      references: thread.referencesHeader,
      body,
    });

    revalidatePath("/gmail");
    return { ok: true, mode: input.mode };
  } catch (err) {
    if (err instanceof GmailWriteError && (err.status === 403 || err.status === 401))
      return {
        ok: false,
        error:
          "Permission Gmail insuffisante pour envoyer. Reconnecte ton compte Google (bouton en haut).",
      };
    console.error("sendReplyAction", err);
    return { ok: false, error: "Échec de l'envoi. Réessaie." };
  }
}
