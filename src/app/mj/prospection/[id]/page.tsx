import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import MjTabs from "../../MjTabs";
import ProspectDetail from "./ProspectDetail";
import InteractionLog from "./InteractionLog";
import QuickStatus from "../QuickStatus";
import { auth } from "@/auth";
import { getProspect } from "@/lib/prospection";

export default async function ProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const p = await getProspect(id);
  if (!p) notFound();

  const iso = (d: Date | null) => (d ? d.toISOString() : null);

  return (
    <>
      <PageHeader
        title={p.name}
        subtitle="Prospect M&J"
        action={
          <div className="flex items-center gap-2">
            <QuickStatus id={p.id} status={p.status} />
            <Link
              href="/mj/prospection"
              className="text-sm font-medium text-muted hover:text-text hover:underline"
            >
              ← Retour
            </Link>
          </div>
        }
      />
      <MjTabs />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <ProspectDetail
          prospect={{
            id: p.id,
            name: p.name,
            segment: p.segment,
            contactName: p.contactName,
            email: p.email,
            phone: p.phone,
            address: p.address,
            website: p.website,
            sector: p.sector,
            headcount: p.headcount,
            budgetEur: p.budgetEur,
            eventsPerYear: p.eventsPerYear,
            firstContact: iso(p.firstContact),
            lastContact: iso(p.lastContact),
            status: p.status,
            notes: p.notes,
          }}
        />
        <InteractionLog
          prospectId={p.id}
          interactions={p.interactions.map((it) => ({
            id: it.id,
            date: it.date.toISOString(),
            kind: it.kind,
            who: it.who,
            summary: it.summary,
            nextAt: iso(it.nextAt),
          }))}
        />
      </div>
    </>
  );
}
