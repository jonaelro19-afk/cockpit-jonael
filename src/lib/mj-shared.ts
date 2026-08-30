// Config + formatage du module M&J, SANS accès base de données.
// Importable côté client (composants "use client") comme côté serveur.

export const PROJECT_KINDS = ["Photo", "Vidéo", "Photo + Vidéo"] as const;

export const PROJECT_STATUSES = [
  "Devis",
  "Confirmé",
  "Tournage",
  "Montage",
  "Livré",
  "Annulé",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// Couleur par statut. `badge` = prop du composant Badge ; `bar` = hex pour la frise.
export const statusMeta: Record<
  string,
  { badge: "gray" | "blue" | "amber" | "purple" | "green" | "red"; bar: string }
> = {
  Devis: { badge: "gray", bar: "#7c7c82" },
  Confirmé: { badge: "blue", bar: "#3b82f6" },
  Tournage: { badge: "amber", bar: "#f59e0b" },
  Montage: { badge: "purple", bar: "#8b5cf6" },
  Livré: { badge: "green", bar: "#34c759" },
  Annulé: { badge: "red", bar: "#4b4b50" },
};

export function fmtEur(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n.toLocaleString("fr-FR")} €`;
}

// Montant précis (2 décimales) : "1 234,50 €"
export function fmtMoney(n: number): string {
  return `${n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export const QUOTE_STATUSES = [
  "Brouillon",
  "Envoyé",
  "Accepté",
  "Refusé",
] as const;

export const QUOTE_UNITS = [
  "forfait",
  "jour",
  "demi-journée",
  "heure",
  "photo",
  "vidéo",
  "km",
] as const;

export const quoteStatusBadge: Record<
  string,
  "gray" | "blue" | "green" | "red"
> = {
  Brouillon: "gray",
  Envoyé: "blue",
  Accepté: "green",
  Refusé: "red",
};

// ---------- Suivi matériel ----------

export const EQUIPMENT_CATEGORIES = [
  "Caméra",
  "Objectif",
  "Son",
  "Lumière",
  "Stabilisation",
  "Stockage",
  "Informatique",
  "Accessoire",
  "Autre",
] as const;

export const EQUIPMENT_CONDITIONS = [
  "neuf",
  "bon",
  "usé",
  "à réviser",
  "HS",
] as const;

export const PRIORITY_LABEL: Record<number, string> = {
  1: "haute",
  2: "moyenne",
  3: "basse",
};

export type QuoteLineInput = {
  label: string;
  detail: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

// Totaux d'un devis à partir de ses lignes.
export function quoteTotals(
  lines: { quantity: number; unitPrice: number }[],
  vatRate: number,
) {
  const ht = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const vat = ht * (vatRate / 100);
  return { ht, vat, ttc: ht + vat };
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// "ven. 12 sept. 2026 à 14:30"  (sans l'heure si minuit)
export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  const day = date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  if (!hasTime) return day;
  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} à ${time}`;
}

// "dans 5 j" / "aujourd'hui" / "il y a 2 j"
export function relativeDays(d: Date | string | null | undefined): string {
  if (!d) return "";
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return "demain";
  if (diff === -1) return "hier";
  return diff > 0 ? `dans ${diff} j` : `il y a ${-diff} j`;
}
