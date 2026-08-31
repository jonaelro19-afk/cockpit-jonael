"use server";
// Actions du module Gmail : archivage (retire de la boîte de réception).

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getGoogleAccessToken } from "@/lib/google/token";
import { archiveMessages, type Bucket } from "@/lib/google/gmail";
import { loadInbox } from "@/lib/gmail-inbox";

async function sessionOrThrow() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  return session.user.id;
}

async function tokenOrThrow() {
  const userId = await sessionOrThrow();
  const t = await getGoogleAccessToken(userId);
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
  const userId = await sessionOrThrow();
  const [accessToken, inbox] = await Promise.all([
    tokenOrThrow(),
    loadInbox(userId),
  ]);
  if (!inbox.ok) return;
  const ids = inbox.mails.filter((m) => m.bucket === bucket).map((m) => m.id);
  await archiveMessages({ accessToken, ids });
  revalidatePath("/gmail");
  revalidatePath("/");
}
