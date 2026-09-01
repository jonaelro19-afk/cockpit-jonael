import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import NewFicheForm from "./NewFicheForm";
import { auth } from "@/auth";
import { getSubjectsSimple } from "@/lib/bts";

export default async function NewFichePage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const subjects = await getSubjectsSimple();

  return (
    <>
      <PageHeader
        title="Nouvelle fiche de révision"
        subtitle="Colle ton cours, l'IA le met en fiche"
        action={
          <Link
            href="/bts/fiches"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Retour
          </Link>
        }
      />
      <Card>
        <NewFicheForm subjects={subjects} />
      </Card>
    </>
  );
}
