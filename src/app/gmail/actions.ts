"use server";
// Actions du module Gmail : archivage (retire de la boîte de réception).

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getGoogleAccessToken } from "@/lib/google/token";
import { listInbox, archiveMessages, type Bucket } from "@/lib/google/gmail";

async function tokenOrThrow() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const t = await getGoogleAccessToken(session.user.id);
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
  const accessToken = await tokenOrThrow();
  const inbox = await listInbox({ accessToken, max: 60 });
  if (!inbox.ok) return;
  const ids = inbox.mails.filter((m) => m.bucket === bucket).map((m) => m.id);
  await archiveMessages({ accessToken, ids });
  revalidatePath("/gmail");
  revalidatePath("/");
}
