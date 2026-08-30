import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import ClientCard from "../../ClientCard";
import { updateClient, deleteClient } from "../../actions";
import { auth } from "@/auth";
import { getClient, statusMeta, fmtDate } from "@/lib/mj";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const updateWithId = updateClient.bind(null, id);
  const deleteWithId = deleteClient.bind(null, id);

  return (
    <>
      <PageHeader
        title={client.name}
        subtitle={client.company ?? undefined}
        action={
          <Link
            href="/mj/clients"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Clients
          </Link>
        }
      />

      <ClientCard client={client} updateAction={updateWithId} />

      <Card
        title="Projets"
        className="mt-5 mb-5"
        action={
          <Link
            href={`/mj/projets/nouveau?client=${client.id}`}
            className="btn-secondary"
          >
            + Projet
          </Link>
        }
      >
        {client.projects.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            Aucun projet pour ce client.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {client.projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/mj/projets/${p.id}`}
                  className="flex items-center gap-3 py-2.5 hover:opacity-80"
                >
                  <Badge color={statusMeta[p.status]?.badge ?? "gray"}>
                    {p.status}
                  </Badge>
                  <span className="flex-1 truncate text-sm text-text">
                    {p.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {fmtDate(p.deadline)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <form action={deleteWithId}>
        <button
          type="submit"
          className="text-sm font-medium text-live hover:underline"
        >
          Supprimer ce client
        </button>
      </form>
    </>
  );
}
