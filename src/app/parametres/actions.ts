"use server";
// Server actions de la page Paramètres : appelées directement depuis les
// formulaires, elles s'exécutent sur le serveur et rafraîchissent l'affichage.

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGoogleAccessToken } from "@/lib/google/token";
import { listCalendarList } from "@/lib/google/calendar";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  return session.user.id;
}

function refresh() {
  revalidatePath("/parametres");
  revalidatePath("/timebox");
}

export async function toggleTimebox(id: string, value: boolean) {
  await requireUserId();
  await prisma.calendarSource.update({
    where: { id },
    data: { includeInTimebox: value },
  });
  refresh();
}

export async function setCategory(id: string, category: string) {
  await requireUserId();
  await prisma.calendarSource.update({ where: { id }, data: { category } });
  refresh();
}

// Récupère la liste des calendriers depuis Google et met la base à jour :
// ajoute les nouveaux, réactive/renomme les existants, désactive les disparus.
export async function resyncCalendars() {
  const userId = await requireUserId();
  const token = await getGoogleAccessToken(userId);
  if (!token.accessToken) throw new Error("Accès Google indisponible");

  const remote = await listCalendarList(token.accessToken);
  const remoteIds = new Set(remote.filter((c) => !c.deleted).map((c) => c.id));

  for (const c of remote) {
    if (c.deleted) continue;
    const label = c.summaryOverride || c.summary || c.id;
    await prisma.calendarSource.upsert({
      where: { googleCalendarId: c.id },
      update: { label, active: true },
      create: { googleCalendarId: c.id, label, active: true },
    });
  }

  const known = await prisma.calendarSource.findMany();
  for (const k of known) {
    if (!remoteIds.has(k.googleCalendarId) && k.active) {
      await prisma.calendarSource.update({
        where: { id: k.id },
        data: { active: false },
      });
    }
  }

  refresh();
}
