// Client Gmail : lecture de la boîte + classement + archivage.
// Scope requis : https://www.googleapis.com/auth/gmail.modify

const BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

// On ne traite que les mails reçus à partir de cette date (le vieux
// backlog de non-lus est laissé tel quel). Format Gmail : AAAA/MM/JJ.
const MAIL_CUTOFF = "2026/07/30";

export type Bucket = "important" | "avoir" | "bruit";

export type MailSummary = {
  id: string;
  threadId: string;
  from: string; // nom affiché
  fromEmail: string;
  to: string; // en-tête To brut
  cc: string; // en-tête Cc brut
  messageIdHeader: string; // en-tête Message-ID (pour répondre dans le fil)
  subject: string;
  snippet: string;
  date: string; // ISO
  unread: boolean;
  bucket: Bucket;
  reason: string; // pourquoi ce classement
};

export type InboxResult =
  | { ok: true; mails: MailSummary[] }
  | { ok: false; reason: "api-disabled" | "scope" | "error"; detail?: string };

type GmailMessage = {
  id: string;
  threadId: string;
  snippet?: string;
  labelIds?: string[];
  internalDate?: string;
  payload?: { headers?: { name: string; value: string }[] };
};

function header(msg: GmailMessage, name: string): string {
  return (
    msg.payload?.headers?.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    )?.value ?? ""
  );
}

function parseFrom(raw: string): { name: string; email: string } {
  const m = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || m[2].trim(), email: m[2].trim().toLowerCase() };
  return { name: raw.trim(), email: raw.trim().toLowerCase() };
}

// ─────────────────────────────────────────────────────────────
//  Règle de tri (voulue par Jonael, 31/08/2026) :
//  « Seules les PUBS / OFFRES / SPONSORS sont archivées.
//    Tout le reste est gardé et mis en IMPORTANT — il ne faut
//    rien louper. Dans le doute → important. »
// ─────────────────────────────────────────────────────────────

// Ce qui concerne l'entreprise de Jonael → toujours important.
const BUSINESS =
  /\bm\s*&\s*j\b|\bm\s*et\s*j\b|m&j\s*production|mj\s*production|mjproduction|m-j-production/i;

// Expéditeur "sans réponse" typique des envois automatiques de masse.
const NOREPLY =
  /(no-?reply|do-?not-?reply|donotreply|noreply|nepasrepondre|ne-pas-repondre|mailer-daemon|newsletter@|news@|marketing@|hello@|info@|contact@|team@|updates?@|notif)/i;

// Argent / RDV / administratif : on ne rate jamais ça.
const KEEP =
  /(factur|\bdevis\b|remboursement|virement|paiement|\bpay[ée]e?\b|[ée]ch[ée]ance|pr[ée]l[èe]vement|rendez.?vous|\brdv\b|convocation|contrat|\bimp[oô]ts?\b|mise en demeure|\brelance\b|\b[àa] r[ée]gler\b|bulletin de (paie|salaire)|attestation|r[ée]siliation|re[çc]u fiscal|dossier|candidature|entretien|convention de stage|inscription)/i;

// Sujets/contenus clairement promotionnels.
const PROMO =
  /(-\s?\d{1,3}\s?%|\bpromo(tion|s)?\b|\bsoldes?\b|\boffres?\b(?!\s+d'?emploi)|derni[èe]re?s?\s+(jour|heures?|chance)|\bgratuit\b|d[ée]couvrez\s+(nos|notre|la|le|le\s|nouvelle)|profitez\s+(de|d'?en)|ventes?\s+priv[ée]e?s?|black\s?friday|cyber\s?monday|code\s+promo|\bdeals?\b|\br[ée]ductions?\b|\bremises?\b|d[ée]bloquez\s+(vos|votre)|\b[ée]conomisez\b|d[ée]stockage|liquidation|jusqu'?[àa]\s?-?\s?\d|\bnewsletter\b|votre\s+s[ée]lection|nos\s+(recommandations|nouveaut[ée]s|conseils)|meilleures?\s+ventes|flash\s+sale|prix\s+cass[ée]s|bon\s+plan|\bchallenge\b|\bwebinar\b|\bwebinaire\b|here\s+we\s+go|c'?est\s+parti|\bcashback\b|parrainage|invitez\s+vos|cadeau)/i;

// Démarchage sponsor / partenariat rémunéré / affiliation.
const SPONSOR_SPAM =
  /(sponsoris|partenariat\s+r[ée]mun[ée]r|collaboration\s+(commerciale|r[ée]mun[ée]r)|placement\s+de\s+produit|programme\s+d'?affiliation|devenez\s+(notre\s+)?partenaire|gagnez\s+de\s+l'?argent|opportunit[ée]\s+d'?affaires|augmentez\s+votre\s+(chiffre|ca)|boostez\s+votre\s+(visibilit[ée]|business|activit[ée])|campagne\s+d'?influence|nous\s+aimerions\s+vous\s+sponsoriser|proposition\s+de\s+partenariat)/i;

// Réseaux sociaux / plateformes → notifications marketing.
const SOCIAL_MARKETING =
  /(linkedin|instagram|facebook|twitter|x\.com|tiktok|pinterest|snapchat|meetup|strava|youtube|twitch|chess\.com|duolingo|spotify|deezer|pinterest)/i;

// Organismes dont les mails comptent toujours (jamais archivés).
const PROTECTED =
  /(doctolib|\bmgen\b|ameli|cpam|\bcaf\b|crous|impots?\.gouv|impots?\.fr|urssaf|france\s?travail|pole.?emploi|service.?public|ants\.gouv|laposte|colissimo|chronopost|mondial.?relay|relais\s?colis|\bbanque\b|\bcr[ée]dit\b|caisse\s?d'?[ée]pargne|bourso|boursobank|boursorama|qonto|\bshine\b|revolut|\bn26\b|lydia|\blcl\b|\bbnp\b|soci[ée]t[ée]\s?g[ée]n[ée]rale|scouts?\s?et\s?guides|\bsgdf\b|guides?\s?de\s?france|v[éeô]l[ôo]?\s?toulouse|tiss[ée]o|greffe|tribunal|notaire|huissier|\bmaif\b|\bmacif\b|\bmatmut\b|harmonie\s?mutuelle|\bedf\b|\bengie\b|\bcnous\b|caf\.fr|assurance.?maladie|s[ée]curit[ée]\s?sociale|prefecture|mairie|acad[ée]mie|rectorat|\bbts\b|lyc[ée]e|greta|afpa|cci\b)/i;

// "Prénom Nom" — 2–3 mots, chacun commençant par une majuscule.
// (tolère un nom de famille tout en capitales : « Cédric ROUTABOUL »)
const PERSON_NAME =
  /^[A-ZÀ-Ÿ][A-Za-zà-ÿÀ-Ÿ'’-]+(?:\s+[A-ZÀ-Ÿ][A-Za-zà-ÿÀ-Ÿ'’-]+){1,2}$/;
const BRAND_WORDS =
  /(fid[ée]lit[ée]|\bclub\b|\bteam\b|[ée]quipe|\bshop\b|\bstore\b|\bnews\b|contact|support|\binfo\b|hello|jobs?|service|noreply|newsletter|marketing|alertes?|notification)/i;

// Automatique mais utile → "à voir" (jamais archivé).
const ROUTINE =
  /(code\s+(de\s+)?(v[ée]rification|confirmation|s[ée]curit[ée]|connexion|acc[èe]s)|verification\s+code|votre\s+code|code\s+[àa]\s+usage\s+unique|\botp\b|mot\s+de\s+passe|colis\s+(livr[ée]|exp[ée]di[ée])|commande\s+(exp[ée]di[ée]e|livr[ée]e|confirm[ée]e)|votre\s+commande\s+a\s+[ée]t[ée]|num[ée]ro\s+de\s+suivi|suivi\s+de\s+(votre\s+)?(commande|livraison|colis)|nouvelle\s+connexion|alerte\s+de\s+connexion)/i;

function classify(m: {
  labelIds: Set<string>;
  fromEmail: string;
  fromName: string;
  subject: string;
  snippet: string;
  listUnsub: boolean;
  boost: string[]; // mots-clés (M&J, noms de clients…) qui forcent "important"
}): { bucket: Bucket; reason: string } {
  const L = m.labelIds;
  const who = `${m.fromName} ${m.fromEmail}`;
  const hay = `${m.fromName} ${m.fromEmail} ${m.subject} ${m.snippet}`;
  const hayLow = hay.toLowerCase();
  const subjSnip = `${m.subject} ${m.snippet}`;

  // ── 0. Signaux qui forcent "important", quoi qu'il arrive ──────────
  if (BUSINESS.test(hay))
    return { bucket: "important", reason: "concerne M&J Production" };
  if (m.boost.some((k) => k.length >= 4 && hayLow.includes(k.toLowerCase())))
    return { bucket: "important", reason: "contact / client connu" };
  if (L.has("STARRED")) return { bucket: "important", reason: "suivi (★)" };
  if (KEEP.test(subjSnip))
    return { bucket: "important", reason: "argent / RDV / administratif" };

  const looksLikePerson =
    !NOREPLY.test(m.fromEmail) &&
    !m.listUnsub &&
    (L.has("CATEGORY_PERSONAL") ||
      (PERSON_NAME.test(m.fromName.trim()) && !BRAND_WORDS.test(m.fromName)));
  if (looksLikePerson)
    return { bucket: "important", reason: "message d'une personne" };

  // ── 1. Organismes / institutions → important (jamais au rebut) ─────
  if (PROTECTED.test(who))
    return { bucket: "important", reason: "organisme / administration" };

  // ── 2. Automatique mais utile (code, livraison) → à voir ──────────
  if (ROUTINE.test(subjSnip))
    return { bucket: "avoir", reason: "code / suivi de livraison" };

  // ── 3. PUB / OFFRE / SPONSOR / newsletter marketing → bruit ───────
  const socialNotif =
    (L.has("CATEGORY_SOCIAL") || SOCIAL_MARKETING.test(who)) &&
    !L.has("CATEGORY_PERSONAL");
  // Envoi de masse marketing : lien de désinscription + rangé par Gmail en
  // Promotions/Forums, ou expéditeur de type newsletter, ET ton marketing.
  const marketingBlast =
    m.listUnsub &&
    (L.has("CATEGORY_PROMOTIONS") ||
      L.has("CATEGORY_FORUMS") ||
      (NOREPLY.test(m.fromEmail) &&
        /(newsletter|actus?|magazine|s[ée]lection|hebdo|mensuel|[ée]dition|nouveaut[ée]s|[àa]\s+ne\s+pas\s+manquer|le\s+best\s+of|au\s+programme)/i.test(
          subjSnip,
        )));

  if (SPONSOR_SPAM.test(hay))
    return { bucket: "bruit", reason: "démarchage sponsor" };
  if (L.has("CATEGORY_PROMOTIONS") || PROMO.test(subjSnip))
    return { bucket: "bruit", reason: "pub / offre" };
  if (socialNotif)
    return { bucket: "bruit", reason: "notification réseau social" };
  if (marketingBlast)
    return { bucket: "bruit", reason: "newsletter / envoi de masse" };

  // ── 4. Dans le doute : on garde et on met en avant ───────────────
  return { bucket: "important", reason: "à ne pas manquer" };
}

function classifyStatus(status: number, body: string): InboxResult & { ok: false } {
  if (status === 403 && /has not been used|is disabled|SERVICE_DISABLED/.test(body))
    return { ok: false, reason: "api-disabled", detail: body.slice(0, 200) };
  if (status === 403 || status === 401)
    return { ok: false, reason: "scope", detail: body.slice(0, 200) };
  return { ok: false, reason: "error", detail: body.slice(0, 200) };
}

export async function listInbox(opts: {
  accessToken: string;
  max?: number;
  boostKeywords?: string[];
}): Promise<InboxResult> {
  const boost = opts.boostKeywords ?? [];

  // Uniquement les mails NON LUS de la boîte, reçus après la date de bascule.
  const listRes = await fetch(
    `${BASE}/messages?maxResults=${opts.max ?? 60}&q=${encodeURIComponent(
      `in:inbox is:unread after:${MAIL_CUTOFF}`,
    )}`,
    {
      headers: { Authorization: `Bearer ${opts.accessToken}` },
      cache: "no-store",
    },
  );
  if (!listRes.ok) return classifyStatus(listRes.status, await listRes.text());

  const { messages } = (await listRes.json()) as { messages?: { id: string }[] };
  if (!messages?.length) return { ok: true, mails: [] };

  const detailed = await Promise.all(
    messages.map(async (m) => {
      const res = await fetch(
        `${BASE}/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Message-ID&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=List-Unsubscribe`,
        {
          headers: { Authorization: `Bearer ${opts.accessToken}` },
          cache: "no-store",
        },
      );
      if (!res.ok) return null;
      const msg = (await res.json()) as GmailMessage;
      const { name, email } = parseFrom(header(msg, "From"));
      const labelIds = new Set(msg.labelIds ?? []);
      const subject = header(msg, "Subject") || "(sans objet)";
      const snippet = (msg.snippet ?? "").replace(/&#39;/g, "'");
      const { bucket, reason } = classify({
        labelIds,
        fromEmail: email,
        fromName: name,
        subject,
        snippet,
        listUnsub: Boolean(header(msg, "List-Unsubscribe")),
        boost,
      });
      return {
        id: msg.id,
        threadId: msg.threadId,
        from: name,
        fromEmail: email,
        to: header(msg, "To"),
        cc: header(msg, "Cc"),
        messageIdHeader: header(msg, "Message-ID"),
        subject,
        snippet,
        date: msg.internalDate
          ? new Date(Number(msg.internalDate)).toISOString()
          : new Date().toISOString(),
        unread: labelIds.has("UNREAD"),
        bucket,
        reason,
      } satisfies MailSummary;
    }),
  );

  return {
    ok: true,
    mails: detailed
      .filter((m): m is MailSummary => m != null)
      .sort((a, b) => b.date.localeCompare(a.date)),
  };
}

// Archive (retire le label INBOX) une liste de messages.
export async function archiveMessages(opts: {
  accessToken: string;
  ids: string[];
}): Promise<{ ok: boolean; count: number; detail?: string }> {
  if (opts.ids.length === 0) return { ok: true, count: 0 };
  const res = await fetch(`${BASE}/messages/batchModify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: opts.ids, removeLabelIds: ["INBOX"] }),
  });
  if (!res.ok) return { ok: false, count: 0, detail: (await res.text()).slice(0, 200) };
  return { ok: true, count: opts.ids.length };
}

// ─────────────────────────────────────────────────────────────
//  Répondre à un mail
// ─────────────────────────────────────────────────────────────

export class GmailWriteError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "GmailWriteError";
  }
}

type GmailPart = {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
};

function decodeB64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
    "utf8",
  );
}

// Extrait le texte lisible d'un message (privilégie text/plain).
function partToText(part: GmailPart | undefined): string {
  if (!part) return "";
  if (part.mimeType === "text/plain" && part.body?.data)
    return decodeB64Url(part.body.data);
  if (part.parts) {
    const plain = part.parts.find((p) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeB64Url(plain.body.data);
    for (const p of part.parts) {
      const t = partToText(p);
      if (t) return t;
    }
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    return decodeB64Url(part.body.data)
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ");
  }
  return "";
}

export type ThreadForReply = {
  subject: string;
  replyTo: string; // adresse à qui répondre
  lastMessageIdHeader: string;
  referencesHeader: string;
  messages: { from: string; date: string; text: string }[];
};

// Récupère le fil complet, pour donner le contexte à l'IA + les en-têtes
// nécessaires à une vraie réponse dans le fil.
export async function getThreadForReply(opts: {
  accessToken: string;
  threadId: string;
}): Promise<ThreadForReply> {
  const res = await fetch(
    `${BASE}/threads/${opts.threadId}?format=full`,
    { headers: { Authorization: `Bearer ${opts.accessToken}` }, cache: "no-store" },
  );
  if (!res.ok)
    throw new GmailWriteError(res.status, `Lecture du fil : ${res.status}`);
  const data = (await res.json()) as {
    messages?: (GmailMessage & { payload?: GmailPart })[];
  };
  const msgs = data.messages ?? [];

  const messages = msgs.map((m) => ({
    from: header(m as GmailMessage, "From"),
    date: header(m as GmailMessage, "Date"),
    text: partToText(m.payload as GmailPart).trim().slice(0, 4000),
  }));

  const last = msgs[msgs.length - 1] as GmailMessage | undefined;
  const first = msgs[0] as GmailMessage | undefined;
  const replyToRaw = last
    ? header(last, "Reply-To") || header(last, "From")
    : "";
  const ids = msgs
    .map((m) => header(m as GmailMessage, "Message-ID"))
    .filter(Boolean);

  return {
    subject: first ? header(first, "Subject") : "",
    replyTo: parseFrom(replyToRaw).email,
    lastMessageIdHeader: last ? header(last, "Message-ID") : "",
    referencesHeader: ids.join(" "),
    messages,
  };
}

function mimeWord(s: string): string {
  return /[^\x00-\x7F]/.test(s)
    ? `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`
    : s;
}

function buildRawReply(opts: {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  inReplyTo: string;
  references: string;
  body: string;
}): string {
  const subject = /^re\s*:/i.test(opts.subject)
    ? opts.subject
    : `Re: ${opts.subject}`;
  const bodyB64 = (Buffer.from(opts.body, "utf8").toString("base64").match(
    /.{1,76}/g,
  ) ?? []).join("\r\n");

  const headers = [
    `From: ${mimeWord(opts.fromName)} <${opts.fromEmail}>`,
    `To: ${opts.to}`,
    `Subject: ${mimeWord(subject)}`,
    opts.inReplyTo ? `In-Reply-To: ${opts.inReplyTo}` : "",
    opts.references ? `References: ${opts.references}` : "",
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ]
    .filter(Boolean)
    .join("\r\n");

  const raw = `${headers}\r\n\r\n${bodyB64}`;
  return Buffer.from(raw, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export type SendMode = "draft" | "send";

// Crée un brouillon de réponse (mode "draft") ou envoie la réponse
// directement (mode "send") dans le bon fil de discussion.
export async function replyToThread(opts: {
  accessToken: string;
  mode: SendMode;
  threadId: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  inReplyTo: string;
  references: string;
  body: string;
}): Promise<{ id: string }> {
  const raw = buildRawReply(opts);
  const endpoint =
    opts.mode === "send" ? `${BASE}/messages/send` : `${BASE}/drafts`;
  const payload =
    opts.mode === "send"
      ? { raw, threadId: opts.threadId }
      : { message: { raw, threadId: opts.threadId } };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new GmailWriteError(
      res.status,
      `${opts.mode === "send" ? "Envoi" : "Brouillon"} : ${res.status} ${(
        await res.text()
      ).slice(0, 160)}`,
    );
  }
  return (await res.json()) as { id: string };
}
