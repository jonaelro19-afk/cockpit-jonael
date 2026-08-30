import Link from "next/link";
import { Users } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import MjTabs from "../MjTabs";
import { getClients } from "@/lib/mj";

export default async function MjClientsPage() {
  const clients = await getClients();

  return (
    <>
      <PageHeader
        title="M&J Prod"
        subtitle="Clients"
        action={
          <Link href="/mj/clients/nouveau" className="btn-primary">
            + Client
          </Link>
        }
      />
      <MjTabs />

      {clients.length === 0 ? (
        <Card>
          <EmptyState
            Icon={Users}
            title="Aucun client"
            hint="Ajoute tes clients : coordonnées, projets liés, historique."
            action={
              <Link href="/mj/clients/nouveau" className="btn-primary">
                Ajouter un client
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/mj/clients/${c.id}`}
              className="rounded-field border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
            >
              <p className="text-sm font-semibold">{c.name}</p>
              {c.company && (
                <p className="text-xs text-muted">{c.company}</p>
              )}
              <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted">
                {c.phone && <span>{c.phone}</span>}
                {c.email && <span>{c.email}</span>}
              </p>
              <p className="mt-2 font-mono text-[10px] text-muted">
                {c._count.projects} projet{c._count.projects > 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
