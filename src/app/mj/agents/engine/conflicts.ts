// Moteur de conflits inter-agents. Fonctions pures : (outputs) -> Conflict[].
import type { AgentId, AgentOutput, Conflict } from "./types";
import { GRILLE_MJ } from "./grid";

type Outputs = Partial<Record<AgentId, AgentOutput>>;

const facts = (o: Outputs, id: AgentId): Record<string, unknown> =>
  o?.[id]?.facts ?? {};

function nextTier(amount: number): number {
  const tiers = [900, 1200, 1600, 1800];
  return tiers.find((t) => t > amount) ?? amount + 300;
}

type Rule = (o: Outputs) => Omit<Conflict, "id"> | null;

const RULES: Rule[] = [
  // C1 — budget vs étalonnage 4K
  (o) => {
    const c = facts(o, "commercial");
    const e = facts(o, "editing");
    const is4K = String(e.shootFormat ?? "").includes("4K");
    const amount = c.amountEUR as number | undefined;
    if (is4K && typeof amount === "number" && amount < 1200) {
      return {
        between: ["commercial", "editing"],
        field: "budget",
        message: `Montage : ${amount} € trop juste pour un étalonnage 4K S-Log3 (min. post-prod ${e.minPostDays ?? 5} j).`,
        suggestion: `Passer le devis à ${nextTier(amount)} €`,
        patch: { agent: "commercial", facts: { amountEUR: nextTier(amount) } },
      };
    }
    return null;
  },
  // C2 — délai planning < estimation montage
  (o) => {
    const p = facts(o, "planning");
    const e = facts(o, "editing");
    const ta = p.turnaroundDays as number | undefined;
    const mp = e.minPostDays as number | undefined;
    if (typeof ta === "number" && typeof mp === "number" && ta < mp) {
      return {
        between: ["planning", "editing"],
        field: "turnaround",
        message: `Planning : ${ta} j de post-prod prévus, Montage en demande ${mp}.`,
        suggestion: `Étendre le turnaround à ${mp} j ouvrés`,
        patch: { agent: "planning", facts: { turnaroundDays: mp } },
      };
    }
    return null;
  },
  // C3 — 2 jours de tournage mais forfait Standard
  (o) => {
    const c = facts(o, "commercial");
    if (((c.shootDays as number) ?? 0) >= 2 && c.package === "aftermovie_standard") {
      return {
        between: ["commercial", "commercial"],
        field: "package",
        message: `Commercial : 2 jours de tournage facturés au forfait Standard (${GRILLE_MJ.aftermovie_standard.base} €).`,
        suggestion: `Basculer en Premium (${GRILLE_MJ.aftermovie_premium.base} €)`,
        patch: {
          agent: "commercial",
          facts: {
            package: "aftermovie_premium",
            amountEUR: GRILLE_MJ.aftermovie_premium.base,
          },
        },
      };
    }
    return null;
  },
  // C4 — générique demandé mais pas de forfait premium
  (o) => {
    const cr = facts(o, "creative");
    const c = facts(o, "commercial");
    const assets = (cr.assetsToCreate as string[]) ?? [];
    const wantsIntro = assets.some((a) => /génér|generique|intro/i.test(a));
    if (wantsIntro && c.package && c.package !== "aftermovie_premium") {
      return {
        between: ["creative", "commercial"],
        field: "assets",
        message:
          "Créatif : générique d’ouverture prévu, non couvert par un forfait hors Premium.",
        suggestion: "Ajouter une ligne « générique » au devis ou retirer l’asset",
      };
    }
    return null;
  },
  // C5 — date de tournage manquante
  (o) => {
    const p = facts(o, "planning");
    const c = facts(o, "commercial");
    if (!p.shootDate && typeof c.amountEUR === "number") {
      return {
        between: ["planning", "commercial"],
        field: "shootDate",
        message:
          "Planning : date de tournage absente du brief — timeline non figée, devis à confirmer.",
        suggestion: "Poser la question « date d’événement ? » au client",
      };
    }
    return null;
  },
  // C6 — canal YouTube sans export dédié
  (o) => {
    const m = facts(o, "marketing");
    const e = facts(o, "editing");
    const exports = (e.exports as { target?: string }[]) ?? [];
    const hasYT = exports.some((x) => /youtube/i.test(x.target ?? ""));
    if (m.primaryChannel === "YouTube" && !hasYT) {
      return {
        between: ["marketing", "editing"],
        field: "exports",
        message:
          "Marketing : diffusion YouTube prévue, aucun export YouTube dans le plan Montage.",
        suggestion: "Ajouter un export H.264 4K 15–20 Mbps",
        patch: {
          agent: "editing",
          push: {
            key: "exports",
            value: { target: "YouTube", spec: "H.264 MP4 4K 15–20 Mbps" },
          },
        },
      };
    }
    return null;
  },
];

export function detectConflicts(outputs: Outputs): Conflict[] {
  const found: Conflict[] = [];
  RULES.forEach((rule, i) => {
    let res: Omit<Conflict, "id"> | null = null;
    try {
      res = rule(outputs);
    } catch {
      res = null;
    }
    if (res) found.push({ id: `C${i + 1}`, ...res });
  });
  return found;
}

export function applyConflictPatch(outputs: Outputs, conflict: Conflict): Outputs {
  if (!conflict?.patch) return outputs;
  const { agent, facts: patchFacts, push } = conflict.patch;
  const target = outputs[agent];
  if (!target) return outputs;
  const nextFacts: Record<string, unknown> = {
    ...target.facts,
    ...(patchFacts ?? {}),
  };
  if (push) {
    const arr = Array.isArray(nextFacts[push.key])
      ? [...(nextFacts[push.key] as unknown[])]
      : [];
    arr.push(push.value);
    nextFacts[push.key] = arr;
  }
  return {
    ...outputs,
    [agent]: { ...target, facts: nextFacts, patched: true },
  };
}
