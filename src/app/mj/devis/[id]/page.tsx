import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import QuoteBuilder from "../QuoteBuilder";
import { ConvertButton, PaidToggle } from "../InvoiceControls";
import { saveQuote, deleteQuote } from "../actions";
import { auth } from "@/auth";
import { getQuote, getClients, getTarifs } from "@/lib/mj";
import { fmtDate } from "@/lib/mj-shared";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const [quote, clients, tarifs] = await Promise.all([
    getQuote(id),
    getClients(),
    getTarifs(),
  ]);
  if (!quote) notFound();

  const deleteWithId = deleteQuote.bind(null, id);
  const isInvoice = Boolean(quote.invoiceNumber);

  return (
    <>
      <PageHeader
        title={
          isInvoice ? `Facture ${quote.invoiceNumber}` : `Devis ${quote.number}`
        }
        subtitle={quote.title || undefined}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/mj/devis/${id}/imprimer`} className="btn-secondary">
              Imprimer / PDF
            </Link>
            <Link
              href="/mj/devis"
              className="text-sm font-medium text-muted hover:text-text hover:underline"
            >
              ← Retour
            </Link>
          </div>
        }
      />

      {/* Barre facturation */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface p-4">
        {isInvoice ? (
          <>
            <span className="text-sm font-medium">
              Facture {quote.invoiceNumber}
            </span>
            {quote.paidAt ? (
              <Badge color="green">Payée le {fmtDate(quote.paidAt)}</Badge>
            ) : (
              <Badge
                color={
                  quote.dueAt && new Date(quote.dueAt) < new Date()
                    ? "red"
                    : "blue"
                }
              >
                À régler avant {fmtDate(quote.dueAt)}
              </Badge>
            )}
            <div className="ml-auto">
              <PaidToggle id={id} paid={Boolean(quote.paidAt)} />
            </div>
          </>
        ) : (
          <>
            <span className="text-sm text-muted">
              Devis {quote.number} — statut{" "}
              <span className="text-text">{quote.status}</span>
            </span>
            <div className="ml-auto">
              <ConvertButton id={id} disabled={quote.status !== "Accepté"} />
            </div>
          </>
        )}
      </div>

      <Card className="mb-5">
        <QuoteBuilder
          action={saveQuote}
          quote={quote}
          clients={clients}
          tarifs={tarifs}
        />
      </Card>

      <form action={deleteWithId}>
        <button
          type="submit"
          className="text-sm font-medium text-live hover:underline"
        >
          Supprimer {isInvoice ? "cette facture" : "ce devis"}
        </button>
      </form>
    </>
  );
}
