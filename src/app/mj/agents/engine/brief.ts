// Heuristiques de lecture du brief libre. Alimentent les rules() de chaque agent.
// Transparent et déterministe — le mode LLM affine ensuite.
import type { PriceGrid } from "./types";

const MONTHS_FR: Record<string, number> = {
  janvier: 0, "février": 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, "août": 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
  "décembre": 11, decembre: 11,
  jan: 0, feb: 1, "fév": 1, mar: 2, apr: 3, avr: 3, jun: 5, jul: 6, aug: 7,
  sep: 8, oct: 9, nov: 10, dec: 11, "déc": 11,
  january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7,
  september: 8, october: 9, november: 10, december: 11,
};

export type ParsedBrief = {
  text: string;
  clientName: string | null;
  sector: string | null;
  decisionMaker: string | null;
  eventType: string | null;
  participants: number | null;
  shootDate: string | null;
  location: string | null;
  durationMin: number | null;
  budgetHint: number | null;
  deadline: string | null;
  interviews: boolean;
  recurring: boolean;
  b2c: boolean;
  mentionsDrone: boolean;
  darkRoom: boolean;
  gimbal: boolean;
  channelHint: string | null;
};

export function parseBrief(
  brief = "",
  answers: Record<string, string> = {},
): ParsedBrief {
  const text = `${brief}\n${Object.values(answers).join("\n")}`;
  const low = text.toLowerCase();

  return {
    text,
    clientName: firstMatch(text, [
      /client\s*[:\-]\s*([^\n,;]+)/i,
      /pour\s+(?:le\s+|la\s+|l['’])?([A-ZÀ-Ÿ][\w&.\- ]{2,40})/,
    ]),
    sector: firstMatch(low, [/secteur\s*[:\-]\s*([^\n,;]+)/]),
    decisionMaker: firstMatch(low, [
      /(pdg|ceo|dirigeant|office manager|responsable comm|manager|gérant|president|président)/,
    ]),
    eventType: detectEventType(low),
    participants: toInt(
      firstMatch(low, [
        /(\d[\d\s.]{0,6})\s*(?:pax|personnes|participants|invités|convives|cadres|dirigeants)/,
      ]),
    ),
    shootDate: detectDate(text),
    location: firstMatch(text, [
      /(?:lieu|location|salle|théâtre|theatre|adresse)\s*[:\-]\s*([^\n,;]+)/i,
    ]),
    durationMin: toFloat(firstMatch(low, [/(\d[\d.,]?)\s*(?:min|minutes|')/])),
    budgetHint: toInt(firstMatch(low, [/(\d[\d\s.]{2,7})\s*(?:€|eur|euros)/])),
    deadline: detectDate(
      afterKeyword(text, /(deadline|livraison|livrable|rendu|due)/i),
    ),
    interviews:
      /interview|itw|discours|témoignage|temoignage|prise de parole/.test(low),
    recurring:
      /récurrent|recurrent|mensuel|par mois|\/mois|abonnement|contrat social/.test(
        low,
      ),
    b2c: /restaurant|resto|boutique|commerce|b2c/.test(low),
    mentionsDrone: /drone|aérien|aerien/.test(low),
    darkRoom:
      /salle sombre|peu de lumière|lumiere faible|low light|obscur|tamis/.test(
        low,
      ),
    gimbal: /gimbal|ronin|stabilis/.test(low),
    channelHint: detectChannel(low),
  };
}

export function guessPackage(p: ParsedBrief): string {
  if (p.recurring && p.b2c) return "b2c_resto";
  if (p.recurring) return "social_recurring";
  const twoDays =
    p.interviews ||
    (p.durationMin != null && p.durationMin >= 4) ||
    (p.participants != null && p.participants >= 150);
  const low = p.text.toLowerCase();
  if (/photo/.test(low) && /vid[ée]o/.test(low)) return "photo_video_event";
  return twoDays ? "aftermovie_premium" : "aftermovie_standard";
}

export function baseAmount(pkg: string, p: ParsedBrief, grid: PriceGrid): number {
  const g = grid[pkg];
  if (!g) return 900;
  if (g.base) return g.base;
  if (g.monthly) return g.monthly;
  if (g.min && g.max) {
    return p.participants != null && p.participants >= 150
      ? g.max
      : Math.round((g.min + g.max) / 2);
  }
  return 900;
}

// ---- helpers ----
function detectEventType(low: string): string | null {
  const map: [string, string][] = [
    ["gala", "gala"], ["conférence", "conférence"], ["conference", "conférence"],
    ["séminaire", "séminaire"], ["seminaire", "séminaire"],
    ["lancement", "lancement produit"], ["inauguration", "inauguration"],
    ["team building", "team building"], ["teambuilding", "team building"],
    ["salon", "salon"], ["assemblée", "assemblée générale"],
    ["soirée", "soirée"], ["afterwork", "afterwork"], ["mariage", "mariage"],
  ];
  for (const [k, v] of map) if (low.includes(k)) return v;
  return null;
}

function detectChannel(low: string): string | null {
  if (/linkedin/.test(low)) return "LinkedIn";
  if (/youtube/.test(low)) return "YouTube";
  if (/instagram|reels|tiktok/.test(low)) return "Instagram";
  if (/interne|internal|onboarding/.test(low)) return "Internal";
  if (/site|website|web/.test(low)) return "Website";
  return null;
}

function firstMatch(str: string, regexes: RegExp[]): string | null {
  for (const re of regexes) {
    const m = str.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

function afterKeyword(str: string, re: RegExp): string {
  const m = str.match(re);
  return m && m.index != null ? str.slice(m.index) : "";
}

function toInt(s: string | null): number | null {
  if (!s) return null;
  const n = parseInt(String(s).replace(/[\s.]/g, ""), 10);
  return Number.isNaN(n) ? null : n;
}

function toFloat(s: string | null): number | null {
  if (!s) return null;
  const n = parseFloat(String(s).replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

function detectDate(text: string): string | null {
  if (!text) return null;
  let m = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = text.match(/\b(\d{1,2})[/.](\d{1,2})(?:[/.](20\d{2}))?\b/);
  if (m) return `${m[3] || new Date().getFullYear()}-${pad(m[2])}-${pad(m[1])}`;
  m = text.match(/\b(\d{1,2})\s+([a-zéûôA-ZÉ]+)\.?\s*(20\d{2})?/);
  if (m) {
    const mo = MONTHS_FR[m[2].toLowerCase()];
    if (mo !== undefined) {
      const year = m[3] || new Date().getFullYear();
      return `${year}-${pad(mo + 1)}-${pad(m[1])}`;
    }
  }
  m = text.match(/\b([a-zA-Zéû]+)\s+(\d{1,2}),?\s*(20\d{2})?/);
  if (m) {
    const mo = MONTHS_FR[m[1].toLowerCase()];
    if (mo !== undefined) {
      const year = m[3] || new Date().getFullYear();
      return `${year}-${pad(mo + 1)}-${pad(m[2])}`;
    }
  }
  return null;
}

function pad(n: string | number): string {
  return String(n).padStart(2, "0");
}
