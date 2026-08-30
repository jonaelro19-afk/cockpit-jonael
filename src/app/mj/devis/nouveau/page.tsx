import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import QuoteBuilder from "../QuoteBuilder";
import { saveQuote } from "../actions";
import { auth } from "@/auth";
import { getClients, getTarifs, nextQuoteNumber } from "@/lib/mj";

export default async function NewQuotePage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const [clients, tarifs, number] = await Promise.all([
    getClients(),
    getTarifs(),
    nextQuoteNumber(),
  ]);

  return (
    <>
      <PageHeader
        title={`Nouveau devis ${number}`}
        action={
          <Link
            href="/mj/devis"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Devis
          </Link>
        }
      />
      <Card>
        <QuoteBuilder action={saveQuote} clients={clients} tarifs={tarifs} />
      </Card>
    </>
  );
}
