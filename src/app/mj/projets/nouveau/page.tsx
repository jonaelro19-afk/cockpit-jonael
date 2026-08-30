import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import ProjectForm from "../../ProjectForm";
import { createProject } from "../../actions";
import { auth } from "@/auth";
import { getClients } from "@/lib/mj";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { client } = await searchParams;
  const clients = await getClients();

  return (
    <>
      <PageHeader
        title="Nouveau projet"
        action={
          <Link
            href={client ? `/mj/clients/${client}` : "/mj"}
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Retour
          </Link>
        }
      />
      <Card>
        <ProjectForm
          action={createProject}
          clients={clients}
          defaultClientId={client}
          submitLabel="Créer le projet"
        />
      </Card>
    </>
  );
}
