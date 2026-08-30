import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PrintButton from "./PrintButton";
import { auth } from "@/auth";
import { getQuote } from "@/lib/mj";
import { quoteTotals, fmtMoney, fmtDate } from "@/lib/mj-shared";

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const totals = quoteTotals(quote.lines, quote.vatRate);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-3 print:hidden">
        <PrintButton />
        <Link
          href={`/mj/devis/${id}`}
          className="text-sm font-medium text-muted hover:text-text hover:underline"
        >
          ← Retour au devis
        </Link>
      </div>

      {/* Feuille A4 — couleurs claires forcées pour l'impression */}
      <article className="rounded-lg bg-white p-10 text-[13px] leading-relaxed text-zinc-900 shadow-lg print:rounded-none print:p-0 print:shadow-none">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-lg font-bold">M&J Production</p>
            <p className="text-zinc-500">Photographie &amp; vidéo</p>
          </div>
          <div className="text-right">
            {quote.invoiceNumber ? (
              <>
                <p className="text-lg font-bold">FACTURE {quote.invoiceNumber}</p>
                <p className="text-zinc-500">
                  Émise le {fmtDate(quote.invoicedAt)}
                </p>
                {quote.dueAt && (
                  <p className="text-zinc-500">
                    À régler avant le {fmtDate(quote.dueAt)}
                  </p>
                )}
                {quote.paidAt && (
                  <p className="font-semibold text-green-700">
                    Payée le {fmtDate(quote.paidAt)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg font-bold">DEVIS {quote.number}</p>
                <p className="text-zinc-500">Émis le {fmtDate(quote.issuedAt)}</p>
                {quote.validUntil && (
                  <p className="text-zinc-500">
                    Valable jusqu&apos;au {fmtDate(quote.validUntil)}
                  </p>
                )}
              </>
            )}
          </div>
        </header>

        {quote.client && (
          <section className="mb-6">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Client
            </p>
            <p className="font-semibold">{quote.client.name}</p>
            {quote.client.company && <p>{quote.client.company}</p>}
            {quote.client.address && <p>{quote.client.address}</p>}
            {quote.client.email && <p>{quote.client.email}</p>}
            {quote.client.phone && <p>{quote.client.phone}</p>}
          </section>
        )}

        {quote.title && (
          <p className="mb-4 text-base font-semibold">{quote.title}</p>
        )}

        <table className="mb-6 w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-zinc-300 text-left text-xs uppercase text-zinc-500">
              <th className="py-2">Prestation</th>
              <th className="py-2 text-right">Qté</th>
              <th className="py-2">Unité</th>
              <th className="py-2 text-right">PU HT</th>
              <th className="py-2 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((l) => (
              <tr key={l.id} className="border-b border-zinc-200 align-top">
                <td className="py-2">
                  {l.label}
                  {l.detail && (
                    <span className="block text-xs text-zinc-500">
                      {l.detail}
                    </span>
                  )}
                </td>
                <td className="py-2 text-right tabular-nums">{l.quantity}</td>
                <td className="py-2">{l.unit}</td>
                <td className="py-2 text-right tabular-nums">
                  {fmtMoney(l.unitPrice)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {fmtMoney(l.quantity * l.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-8 ml-auto w-64 space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-500">Total HT</span>
            <span className="tabular-nums">{fmtMoney(totals.ht)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">TVA ({quote.vatRate} %)</span>
            <span className="tabular-nums">{fmtMoney(totals.vat)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-zinc-300 pt-1 text-base font-bold">
            <span>Total TTC</span>
            <span className="tabular-nums">{fmtMoney(totals.ttc)}</span>
          </div>
        </div>

        {quote.notes && (
          <section className="mb-8 whitespace-pre-wrap text-xs text-zinc-600">
            {quote.notes}
          </section>
        )}

        <section className="mt-12 flex justify-between text-xs text-zinc-500">
          <div>
            <p>Bon pour accord — date et signature :</p>
            <div className="mt-10 h-px w-56 bg-zinc-300" />
          </div>
        </section>
      </article>
    </div>
  );
}
