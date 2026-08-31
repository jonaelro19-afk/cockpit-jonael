"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getGoogleAccessToken } from "@/lib/google/token";
import { createEvent, CalendarWriteError } from "@/lib/google/calendar";

const PARIS = "Europe/Paris";

export type CreateEventState =
  | { ok: true }
  | { ok: false; error: string };

// Crée une vraie boîte de temps dans Google Agenda.
export async function createTimeboxEvent(
  _prev: CreateEventState | null,
  fd: FormData,
): Promise<CreateEventState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };

  const title = String(fd.get("title") ?? "").trim();
  const date = String(fd.get("date") ?? "").trim();
  const start = String(fd.get("start") ?? "").trim();
  const end = String(fd.get("end") ?? "").trim();
  const calendarId = String(fd.get("calendarId") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim();

  if (!title) return { ok: false, error: "Donne un titre à la boîte." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return { ok: false, error: "Date invalide." };
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end))
    return { ok: false, error: "Heures invalides." };
  if (end <= start)
    return { ok: false, error: "La fin doit être après le début." };
  if (!calendarId) return { ok: false, error: "Choisis un calendrier." };

  const token = await getGoogleAccessToken(session.user.id);
  if (!token.accessToken)
    return { ok: false, error: "Reconnecte ton compte Google." };

  try {
    // On envoie l'heure locale + le fuseau : Google fait la conversion,
    // pas de calcul de décalage horaire à faire ici.
    await createEvent({
      accessToken: token.accessToken,
      calendarId,
      event: {
        summary: title,
        description: description || undefined,
        start: { dateTime: `${date}T${start}:00`, timeZone: PARIS },
        end: { dateTime: `${date}T${end}:00`, timeZone: PARIS },
      },
    });
  } catch (err) {
    if (err instanceof CalendarWriteError && (err.status === 403 || err.status === 404))
      return {
        ok: false,
        error:
          "Ce calendrier est en lecture seule. Choisis-en un autre (ton agenda principal).",
      };
    console.error("createTimeboxEvent", err);
    return { ok: false, error: "Échec de la création. Réessaie." };
  }

  revalidatePath("/timebox");
  revalidatePath("/");
  return { ok: true };
}
