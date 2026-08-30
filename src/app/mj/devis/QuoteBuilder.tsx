"use client";
// Créateur de devis : lignes éditables, totaux HT / TVA / TTC en direct.

import { useMemo, useState } from "react";
import {
  QUOTE_STATUSES,
  QUOTE_UNITS,
  fmtMoney,
  quoteTotals,
} from "@/lib/mj-shared";
import type { Client, Quote, QuoteLine, TarifItem } from "@/generated/prisma/client";

type Line = {
  label: string;
  detail: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

const emptyLine: Line = {
  label: "",
  detail: "",
  quantity: 1,
  unit: "forfait",
  unitPrice: 0,
};

function toDateInput(d: Date | string | null | undefined) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function QuoteBuilder({
  action,
  quote,
  clients,
  tarifs,
}: {
  action: (fd: FormData) => void | Promise<void>;
  quote?: Quote & { lines: QuoteLine[] };
  clients: Client[];
  tarifs: TarifItem[];
}) {
  const [lines, setLines] = useState<Line[]>(
    quote?.lines.length
      ? quote.lines.map((l) => ({
          label: l.label,
          detail: l.detail,
          quantity: l.quantity,
          unit: l.unit,
          unitPrice: l.unitPrice,
        }))
      : [{ ...emptyLine }],
  );
  const [vatRate, setVatRate] = useState<number>(quote?.vatRate ?? 0);

  const totals = useMemo(() => quoteTotals(lines, vatRate), [lines, vatRate]);

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const removeLine = (i: number) =>
    setLines((ls) => ls.filter((_, j) => j !== i));
  const addLine = () => setLines((ls) => [...ls, { ...emptyLine }]);
  const addFromTarif = (t: TarifItem) =>
    setLines((ls) => [
      ...ls.filter((l) => l.label || l.unitPrice),
      { label: t.label, detail: "", quantity: 1, unit: t.unit, unitPrice: t.unitPrice },
    ]);

  const label = "mb-1 block text-xs font-medium text-muted";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" defaultValue={quote?.id ?? ""} />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />

      {/* En-tête */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Objet du devis</label>
          <input
            name="title"
            defaultValue={quote?.title ?? ""}
            placeholder="Film de mariage — prestation complète"
            className="field"
          />
        </div>
        <div>
          <label className={label}>Client</label>
          <select
            name="clientId"
            defaultValue={quote?.clientId ?? ""}
            className="field"
          >
            <option value="">— aucun —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Date d&apos;émission</label>
            <input
              type="date"
              name="issuedAt"
              defaultValue={toDateInput(quote?.issuedAt) || toDateInput(new Date())}
              className="field"
            />
          </div>
          <div>
            <label className={label}>Valable jusqu&apos;au</label>
            <input
              type="date"
              name="validUntil"
              defaultValue={toDateInput(quote?.validUntil)}
              className="field"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Statut</label>
            <select
              name="status"
              defaultValue={quote?.status ?? "Brouillon"}
              className="field"
            >
              {QUOTE_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>TVA (%)</label>
            <input
              type="number"
              name="vatRate"
              min="0"
              step="0.1"
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value) || 0)}
              className="field"
            />
          </div>
        </div>
      </div>

      {/* Lignes */}
      <div className="rounded-card border border-line">
        <div className="hidden grid-cols-[1fr_5rem_7rem_7rem_6rem_2rem] gap-2 border-b border-line px-3 py-2 text-[11px] uppercase tracking-wide text-muted sm:grid">
          <span>Prestation</span>
          <span className="text-right">Qté</span>
          <span>Unité</span>
          <span className="text-right">PU HT</span>
          <span className="text-right">Total</span>
          <span />
        </div>
        {lines.map((l, i) => (
          <div
            key={i}
            className="border-b border-line px-3 py-3 last:border-0 sm:grid sm:grid-cols-[1fr_4.5rem_6.5rem_6.5rem_6rem_1.75rem] sm:items-start sm:gap-2"
          >
            <div>
              <input
                value={l.label}
                onChange={(e) => setLine(i, { label: e.target.value })}
                placeholder="Prestation"
                className="field"
              />
              <input
                value={l.detail}
                onChange={(e) => setLine(i, { detail: e.target.value })}
                placeholder="Précision (optionnel)"
                className="field mt-1 text-xs"
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-0 sm:contents">
              <input
                type="number"
                min="0"
                step="0.5"
                value={l.quantity}
                onChange={(e) =>
                  setLine(i, { quantity: Number(e.target.value) || 0 })
                }
                aria-label="Quantité"
                className="field sm:text-right"
              />
              <select
                value={l.unit}
                onChange={(e) => setLine(i, { unit: e.target.value })}
                aria-label="Unité"
                className="field"
              >
                {QUOTE_UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="1"
                value={l.unitPrice}
                onChange={(e) =>
                  setLine(i, { unitPrice: Number(e.target.value) || 0 })
                }
                aria-label="Prix unitaire HT"
                className="field sm:text-right"
              />
            </div>
            <div className="mt-2 flex items-center justify-between sm:mt-0 sm:contents">
              <span className="text-sm font-medium tabular-nums sm:pt-2 sm:text-right">
                {fmtMoney(l.quantity * l.unitPrice)}
              </span>
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="text-muted hover:text-live sm:pt-1.5"
                aria-label="Supprimer la ligne"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 px-3 py-2.5">
          <button type="button" onClick={addLine} className="btn-ghost">
            + Ligne
          </button>
          {tarifs.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const t = tarifs.find((x) => x.id === e.target.value);
                if (t) addFromTarif(t);
              }}
              className="field w-auto"
            >
              <option value="">+ depuis la grille de tarifs…</option>
              {tarifs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} — {fmtMoney(t.unitPrice)}/{t.unit}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Totaux */}
      <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Total HT</span>
          <span className="tabular-nums">{fmtMoney(totals.ht)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">TVA ({vatRate} %)</span>
          <span className="tabular-nums">{fmtMoney(totals.vat)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-1 text-base font-bold">
          <span>Total TTC</span>
          <span className="tabular-nums">{fmtMoney(totals.ttc)}</span>
        </div>
      </div>

      <div>
        <label className={label}>Conditions / mentions</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={
            quote?.notes ??
            "Devis valable 30 jours. Acompte de 30 % à la commande. TVA non applicable, art. 293 B du CGI."
          }
          className="field"
        />
      </div>

      <button type="submit" className="btn-primary">
        {quote ? "Enregistrer le devis" : "Créer le devis"}
      </button>
    </form>
  );
}
