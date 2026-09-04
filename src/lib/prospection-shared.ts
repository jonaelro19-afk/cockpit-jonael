// Constantes Prospection M&J — importables côté client (pas de Prisma).

export const PROSPECT_STATUSES = [
  "À contacter",
  "En cours",
  "Devis envoyé",
  "Négociation",
  "Contrat signé",
  "Refusé",
  "En pause",
] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

// Statuts "vivants" : comptent dans le pipeline et peuvent être relancés.
export const ACTIVE_STATUSES: readonly string[] = [
  "À contacter",
  "En cours",
  "Devis envoyé",
  "Négociation",
];

export const statusMeta: Record<
  string,
  { color: string; dot: string }
> = {
  "À contacter": { color: "#9a9a9e", dot: "#9a9a9e" },
  "En cours": { color: "#38bdf8", dot: "#38bdf8" },
  "Devis envoyé": { color: "#fbbf24", dot: "#fbbf24" },
  Négociation: { color: "#a78bfa", dot: "#a78bfa" },
  "Contrat signé": { color: "#34d399", dot: "#34d399" },
  Refusé: { color: "#f87171", dot: "#f87171" },
  "En pause": { color: "#6b6b70", dot: "#6b6b70" },
};

export const PROSPECT_PRIORITIES = ["haute", "normale", "basse"] as const;
export const priorityMeta: Record<
  string,
  { label: string; color: string; rank: number }
> = {
  haute: { label: "Priorité haute", color: "#f87171", rank: 0 },
  normale: { label: "Priorité normale", color: "#9a9a9e", rank: 1 },
  basse: { label: "Priorité basse", color: "#6b6b70", rank: 2 },
};

export const PROSPECT_SEGMENTS = [
  "Fleuriste",
  "Restaurant",
  "Club d'affaires",
  "Corporate",
  "Événementiel",
  "Institution",
  "Immobilier",
  "Mariage",
  "Autre",
] as const;

export const INTERACTION_KINDS = [
  "Appel",
  "Email",
  "Réunion",
  "Message",
  "Autre",
] as const;

export const WHO_OPTIONS = ["Jonaël", "Malo"] as const;

export const FOLLOWUP_DAYS = 21; // relance si dernier contact plus vieux que ça

// Un prospect actif dont on n'a plus de nouvelles → à relancer.
export function needsFollowUp(p: {
  status: string;
  lastContact: Date | string | null;
}): boolean {
  if (!ACTIVE_STATUSES.includes(p.status)) return false;
  if (!p.lastContact) return true;
  const days =
    (Date.now() - new Date(p.lastContact).getTime()) / 86_400_000;
  return days > FOLLOWUP_DAYS;
}

export function fmtEur0(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
