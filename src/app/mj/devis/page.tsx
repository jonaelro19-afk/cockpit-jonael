import Link from "next/link";
import { FileText, ReceiptEuro } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import MjTabs from "../MjTabs";
import TarifRow from "./TarifRow";
import { addTarif } from "./actions";
import {
  getPlainQuotes,
  getInvoices,
  getInvoiceStats,
  getTarifs,
} from "@/lib/mj";
import {
  quoteTotals,
  fmtMoney,
  fmtDate,
  quoteStatusBadge,
  QUOTE_UNITS,
} from "@/lib/mj-shared";

type Row = Awaited<ReturnType<typeof getPlainQuotes>>[number];

function DocRow({ q, invoice }: { q: Row; invoice?: boolean }) {
  const { ttc } = quoteTotals(q.lines, q.vatRate);
  const overdue =
    invoice && !q.paidAt && q.dueAt && new Date(q.dueAt) < new Date();
  return (
    <li>
      <Link
        href={`/mj/devis/${q.id}`}
        className="flex items-center gap-3 py-3 hover:opacity-80"
      >
        <span className="font-mono text-xs text-muted">
          {invoice ? q.invoiceNumber : q.number}
        </span>
        {invoice ? (
          q.paidAt ? (
            <Badge color="green">payée</Badge>
          ) : overdue ? (
            <Badge color="red">en retard</Badge>
          ) : (
            <Badge color="blue">à encaisser</Badge>
          )
        ) : (
          <Badge color={quoteStatusBadge[q.status] ?? "gray"}>{q.status}</Badge>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">
            {q.client?.name ? `${q.client.name} — ` : ""}
            {q.title || "Sans objet"}
          </p>
          <p className="text-xs text-muted">
            {invoice
              ? `émise le ${fmtDate(q.invoicedAt)}${q.dueAt ? ` · échéance ${fmtDate(q.dueAt)}` : ""}`
              : fmtDate(q.issuedAt)}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-lime">
          {fmtMoney(ttc)}
        </span>
      </Link>
    </li>
  );
}

export default async function DevisPage() {
  const [quotes, invoices, stats, tarifs] = await Promise.all([
    getPlainQuotes(),
    getInvoices(),
    getInvoiceStats(),
    getTarifs(),
  ]);

  return (
    <>
      <PageHeader
        title="M&J Prod"
        subtitle="Devis & factures"
        action={
          <Link href="/mj/devis/nouveau" className="btn-primary">
            + Devis
          </Link>
        }
      />
      <MjTabs />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-2xl font-extrabold tracking-tight text-online">
            {fmtMoney(stats.paid)}
          </p>
          <p className="text-xs text-muted">encaissé (factures payées)</p>
        </Card>
        <Card>
          <p className="text-2xl font-extrabold tracking-tight text-lime">
            {fmtMoney(stats.outstanding)}
          </p>
          <p className="text-xs text-muted">à encaisser</p>
        </Card>
        <Card>
          <p className="text-2xl font-extrabold tracking-tight">
            {quotes.length}
          </p>
          <p className="text-xs text-muted">devis en cours</p>
        </Card>
      </div>

      <Card
        title={`Factures — ${invoices.length}`}
        className="mb-5"
        action={<ReceiptEuro size={15} className="text-muted" />}
      >
        {invoices.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            Aucune facture. Convertis un devis accepté depuis sa fiche.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {invoices.map((q) => (
              <DocRow key={q.id} q={q} invoice />
            ))}
          </ul>
        )}
      </Card>

      <Card title={`Devis — ${quotes.length}`} className="mb-5">
        {quotes.length === 0 ? (
          <EmptyState
            Icon={FileText}
            title="Aucun devis"
            hint="Crée ton premier devis : lignes, totaux HT/TTC, export PDF."
            action={
              <Link href="/mj/devis/nouveau" className="btn-primary">
                Nouveau devis
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {quotes.map((q) => (
              <DocRow key={q.id} q={q} />
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Grille de tarifs de référence">
          {tarifs.length > 0 && (
            <ul className="mb-4 divide-y divide-line">
              {tarifs.map((t) => (
                <TarifRow key={t.id} tarif={t} />
              ))}
            </ul>
          )}
          <form
            action={addTarif}
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            <input
              name="label"
              placeholder="Prestation"
              required
              className="field col-span-2"
            />
            <input
              name="unitPrice"
              type="number"
              min="0"
              step="1"
              placeholder="€ HT"
              className="field"
            />
            <select name="unit" defaultValue="forfait" className="field">
              {QUOTE_UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
            <input
              name="category"
              placeholder="Catégorie (optionnel)"
              className="field col-span-2"
            />
            <button type="submit" className="btn-secondary col-span-2">
              Ajouter à la grille
            </button>
          </form>
        </Card>

        <Card title="Mémo — un bon devis">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
            <li>Numéro unique, date d&apos;émission, durée de validité (30 j).</li>
            <li>Tes coordonnées complètes (SIRET, adresse) + celles du client.</li>
            <li>Chaque prestation détaillée : quantité, unité, prix unitaire HT.</li>
            <li>Ce qui est livré (formats, délais) et ce qui ne l&apos;est pas.</li>
            <li>
              Conditions : acompte à la commande, solde à la livraison, cession
              des droits d&apos;image.
            </li>
            <li>
              Mention TVA : « TVA non applicable, art. 293 B du CGI » si
              auto-entrepreneur.
            </li>
            <li>Case « Bon pour accord », date et signature du client.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
