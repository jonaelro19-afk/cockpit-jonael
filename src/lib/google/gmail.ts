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

const NOREPLY =
  /(no-?reply|do-?not-?reply|donotreply|noreply|nepasrepondre|ne-pas-repondre|notif|newsletter|mailer|mailing|marketing|campaign)/i;

// Expéditeurs "réseaux sociaux / marketing pur" → bruit sans hésiter.
const SOCIAL_MARKETING =
  /(linkedin|instagram|facebook|twitter|x\.com|tiktok|pinterest|snapchat|meetup|strava\.com|h&m|zalando|shein|asos|alltricks|decathlon.*(promo|offre)|monday\.com)/i;
const PROMO_SUBJECT =
  /(-\s?\d{1,3}\s?%|jusqu'?[àa]\s?-?\s?\d|\bpromos?\b|\bsoldes?\b|\boffres?\b|dernier jour|derni[èe]re chance|\bgratuit\b|d[ée]couvrez|\bnewsletter\b|ventes? priv[ée]e?s?|black friday|code promo|\bdeals?\b|\br[ée]duction|\b[ée]conomisez)/i;
// Messages de marketplace (leboncoin, vinted…) = un acheteur potentiel → à voir.
const MARKETPLACE_MSG =
  /(nouveau message|message pour|a r[ée]pondu|vous a envoy[ée] un message)/i;

// Institutions / services dont les mails comptent (au minimum "à voir").
const INSTITUTION =
  /(doctolib|\bmgen\b|ameli|cpam|\bcaf\b|crous|impots?\.gouv|urssaf|pole-?emploi|francetravail|service-public|etudiant\.gouv|laposte|colissimo|chronopost|mondialrelay|mondial-relay|relais colis|banque|\bcredit\b|\bcaisse\b|bourso|boursobank|boursorama|qonto|\bshine\b|revolut|paypal|scouts? et guides|sgdf|v[éeô]l[ôo]toulouse|tiss[ée]o)/i;
// Souscription / abonnement / adhésion → à voir.
const SUBSCRIPTION =
  /(souscription|abonnement|confirmation d'inscription|adh[ée]sion|renouvellement)/i;

// Contenu transactionnel important (facture, RDV, argent, sécurité).
const HIGH_VALUE =
  /(rendez-?vous|\brdv\b|factur|\bdevis\b|remboursement|virement|paiement|\bpay[ée]\b|\bimp[oô]ts?\b|contrat sign|convocation|\brejet\b|refus[ée] (votre|la)|validation de votre demande|bulletin de paie|mise en demeure|\bimpay[ée]\b|\brelance\b|\b[àa] r[ée]gler\b)/i;
// Voyage / transport → important (billet, trajet, embarquement).
const TRAVEL =
  /(voyage|trajet|\bvol\b|embarquement|itin[ée]raire|check-?in|carte d'embarquement|billet|r[ée]servation confirm|votre s[ée]jour|votre r[ée]servation)/i;
// Suivi routinier (à voir mais pas urgent).
const ROUTINE_TXN =
  /(colis|livraison|commande|exp[ée]di[ée]|num[ée]ro de suivi|code (de |d')?(v[ée]rification|connexion|acc[èe]s|s[ée]curit[ée])|code d'acc[èe]s|alerte de connexion|nouvelle connexion|confirmation de commande)/i;

// "Prénom Nom" (2–3 mots, chacun capitalisé, pas de sigle en CAPS, pas de chiffre)
const PERSON_NAME =
  /^[A-ZÀ-Ÿ][a-zà-ÿ'’-]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ'’-]+){1,2}$/;

function classify(m: {
  labelIds: Set<string>;
  fromEmail: string;
  fromName: string;
  subject: string;
  listUnsub: boolean;
}): { bucket: Bucket; reason: string } {
  const L = m.labelIds;
  const who = `${m.fromName} ${m.fromEmail}`;
  const subj = m.subject;

  const personal = L.has("CATEGORY_PERSONAL");
  // Vraie personne qui écrit directement : pas de lien de désinscription
  // (les newsletters/séquences marketing en ont toujours un), et soit
  // Gmail le range en "Personnel", soit le nom ressemble à "Prénom Nom".
  const looksLikePerson =
    !m.listUnsub &&
    !NOREPLY.test(m.fromEmail) &&
    (personal ||
      (PERSON_NAME.test(m.fromName.trim()) &&
        !/(fid[ée]lit[ée]|club|team|[ée]quipe|shop|store|news|contact|support|info|hello|jobs?)/i.test(
          m.fromName,
        )));

  const isPromo =
    L.has("CATEGORY_PROMOTIONS") ||
    L.has("CATEGORY_SOCIAL") ||
    L.has("CATEGORY_FORUMS") ||
    SOCIAL_MARKETING.test(who) ||
    PROMO_SUBJECT.test(subj);

  // 1. Signaux forts d'importance (jamais si c'est une promo)
  if (L.has("STARRED")) return { bucket: "important", reason: "suivi (★)" };
  if (!isPromo && HIGH_VALUE.test(subj))
    return { bucket: "important", reason: "facture / RDV / argent" };
  if (!isPromo && TRAVEL.test(subj))
    return { bucket: "important", reason: "voyage / billet" };
  if (looksLikePerson)
    return { bucket: "important", reason: "message d'une personne" };

  // 2. Promo / réseau social = bruit d'office
  if (isPromo) return { bucket: "bruit", reason: "promo / réseau social" };

  // 3. À voir : organismes, marketplace, suivi de commande, codes, abonnements
  if (MARKETPLACE_MSG.test(subj))
    return { bucket: "avoir", reason: "message marketplace" };
  if (INSTITUTION.test(who))
    return { bucket: "avoir", reason: "organisme / service" };
  if (ROUTINE_TXN.test(subj))
    return { bucket: "avoir", reason: "suivi de commande / code" };
  if (SUBSCRIPTION.test(subj) && !PROMO_SUBJECT.test(subj))
    return { bucket: "avoir", reason: "abonnement / adhésion" };

  // 4. Newsletter / notification / automatique → bruit
  if (m.listUnsub || L.has("CATEGORY_UPDATES"))
    return { bucket: "bruit", reason: "newsletter / notification" };
  return { bucket: "bruit", reason: "expéditeur automatique" };
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
}): Promise<InboxResult> {
  // Uniquement les mails NON LUS de la boîte de réception.
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
        `${BASE}/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=List-Unsubscribe`,
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
      const { bucket, reason } = classify({
        labelIds,
        fromEmail: email,
        fromName: name,
        subject,
        listUnsub: Boolean(header(msg, "List-Unsubscribe")),
      });
      return {
        id: msg.id,
        threadId: msg.threadId,
        from: name,
        fromEmail: email,
        subject,
        snippet: (msg.snippet ?? "").replace(/&#39;/g, "'"),
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
