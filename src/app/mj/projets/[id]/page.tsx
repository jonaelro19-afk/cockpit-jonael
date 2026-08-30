import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ProjectCard from "../../ProjectCard";
import { updateProject, deleteProject } from "../../actions";
import { auth } from "@/auth";
import { getProject, getClients } from "@/lib/mj";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const [project, clients] = await Promise.all([getProject(id), getClients()]);
  if (!project) notFound();

  const updateWithId = updateProject.bind(null, id);
  const deleteWithId = deleteProject.bind(null, id);

  return (
    <>
      <PageHeader
        title={project.title}
        subtitle={project.client?.name ?? "Sans client"}
        action={
          <Link
            href="/mj"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← M&J Prod
          </Link>
        }
      />

      <ProjectCard
        project={project}
        clients={clients}
        updateAction={updateWithId}
      />

      <form action={deleteWithId} className="mt-5">
        <button
          type="submit"
          className="text-sm font-medium text-live hover:underline"
        >
          Supprimer ce projet
        </button>
      </form>
    </>
  );
}
