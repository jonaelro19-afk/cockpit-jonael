// Grille tarifaire M&J de référence + fusion avec la table TarifItem (BDD).
import type { PriceGrid } from "./types";

// Grille « en dur » — socle toujours disponible.
export const GRILLE_MJ: PriceGrid = {
  aftermovie_standard: {
    label: "Aftermovie Standard (2–3 min, 1 j tournage)",
    base: 900,
    shootDays: 1,
    revisions: 2,
  },
  aftermovie_premium: {
    label: "Aftermovie Premium (4 min, 2 j, interviews)",
    base: 1600,
    shootDays: 2,
    revisions: 2,
  },
  photo_video_event: {
    label: "Forfait Photo + Vidéo événement",
    min: 1200,
    max: 1800,
    shootDays: 1,
    revisions: 2,
  },
  social_recurring: {
    label: "Contrat social media récurrent",
    monthly: 1200,
    contractMonths: 3,
    revisions: 2,
  },
  b2c_resto: {
    label: "B2C restaurant (3 mois)",
    monthly: 750,
    contractMonths: 3,
    revisions: 1,
  },
};

export const OFFRE_DECOUVERTE = { b2b: 300, b2c: 150 };

export const REPARTITION_LIGNES = [
  { label: "Préparation + repérage", pct: 0.1 },
  { label: "Tournage (équipe + matériel)", pct: 0.4 },
  { label: "Montage + sound design", pct: 0.3 },
  { label: "Étalonnage + exports", pct: 0.15 },
  { label: "Révisions incluses", pct: 0.05 },
];

type TarifItemLike = {
  label: string;
  unitPrice: number;
  unit?: string;
  category?: string;
};

// Associe un libellé de tarif BDD à une clé de forfait connue.
function matchPackageKey(label: string): keyof typeof GRILLE_MJ | null {
  const l = label.toLowerCase();
  if (/premium/.test(l) && /aftermovie|film|vid/.test(l)) return "aftermovie_premium";
  if (/standard/.test(l) && /aftermovie|film|vid/.test(l)) return "aftermovie_standard";
  if (/aftermovie|film événement|film evenement/.test(l)) return "aftermovie_standard";
  if (/photo.*vid|vid.*photo/.test(l)) return "photo_video_event";
  if ((/social|réseaux|reseaux/.test(l)) && /mois|mensuel|récurrent|recurrent/.test(l))
    return "social_recurring";
  if (/restaurant|resto|b2c/.test(l)) return "b2c_resto";
  return null;
}

// Fusionne la grille en dur avec les vrais tarifs Cockpit : si un TarifItem
// correspond à un forfait connu, son prix écrase le prix « base ».
export function resolveGrid(tarifs?: TarifItemLike[] | null): PriceGrid {
  const grid: PriceGrid = JSON.parse(JSON.stringify(GRILLE_MJ));
  if (!tarifs?.length) return grid;

  for (const t of tarifs) {
    const key = matchPackageKey(t.label);
    if (!key || !Number.isFinite(t.unitPrice) || t.unitPrice <= 0) continue;
    const entry = grid[key];
    const monthly = /mois|mensuel/.test((t.unit ?? "").toLowerCase()) || entry.monthly != null;
    if (monthly) entry.monthly = t.unitPrice;
    else {
      entry.base = t.unitPrice;
      delete entry.min;
      delete entry.max;
    }
    entry.label = `${entry.label} · tarif Cockpit`;
  }
  return grid;
}
