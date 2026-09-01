import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import NewSubjectForm from "./NewSubjectForm";
import { auth } from "@/auth";

export default async function NewSubjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  return (
    <>
      <PageHeader
        title="Nouvelle matière"
        subtitle="Ajoute une matière au carnet"
        action={
          <Link
            href="/bts"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Retour
          </Link>
        }
      />
      <Card>
        <NewSubjectForm />
      </Card>
    </>
  );
}
