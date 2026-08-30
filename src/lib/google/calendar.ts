// Petit client de l'API REST Google Calendar v3.
// On n'utilise pas le paquet "googleapis" (trop lourd) : juste `fetch`.
// Docs : https://developers.google.com/calendar/api/v3/reference

const BASE = "https://www.googleapis.com/calendar/v3";

export type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  htmlLink?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
};

// Liste les événements d'un calendrier sur un intervalle de temps.
// `singleEvents=true` "déplie" les événements récurrents en occurrences.
export async function listEvents(opts: {
  accessToken: string;
  calendarId: string;
  timeMin: string; // ISO 8601
  timeMax: string; // ISO 8601
}): Promise<GoogleEvent[]> {
  const url = new URL(
    `${BASE}/calendars/${encodeURIComponent(opts.calendarId)}/events`,
  );
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeMin", opts.timeMin);
  url.searchParams.set("timeMax", opts.timeMax);
  url.searchParams.set("maxResults", "100");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${opts.accessToken}` },
    // Cache Next.js : on ne rappelle pas Google plus d'une fois toutes les 5 min.
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(
      `Google Calendar (${opts.calendarId}) a répondu ${res.status}`,
    );
  }

  const data = (await res.json()) as { items?: GoogleEvent[] };
  return data.items ?? [];
}

export type GoogleCalendarListEntry = {
  id: string;
  summary?: string;
  summaryOverride?: string;
  backgroundColor?: string;
  deleted?: boolean;
};

// Liste les calendriers auxquels l'utilisateur a accès.
export async function listCalendarList(
  accessToken: string,
): Promise<GoogleCalendarListEntry[]> {
  const res = await fetch(`${BASE}/users/me/calendarList?maxResults=250`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`calendarList a répondu ${res.status}`);
  const data = (await res.json()) as { items?: GoogleCalendarListEntry[] };
  return data.items ?? [];
}

// ─── Écriture (préparé pour plus tard : "ajouter un bloc depuis le cockpit") ───

export async function createEvent(opts: {
  accessToken: string;
  calendarId: string;
  event: {
    summary: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    description?: string;
  };
}): Promise<GoogleEvent> {
  const res = await fetch(
    `${BASE}/calendars/${encodeURIComponent(opts.calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opts.event),
    },
  );
  if (!res.ok) throw new Error(`Création d'événement : ${res.status}`);
  return (await res.json()) as GoogleEvent;
}
