import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Printer } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import FicheView from "../FicheView";
import FicheActions from "./FicheActions";
import { auth } from "@/auth";
import { getFiche } from "@/lib/bts";
import { ficheKind } from "@/lib/bts-shared";

export default async function FichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const fiche = await getFiche(id);
  if (!fiche) notFound();

  return (
    <>
      <PageHeader
        title={fiche.title}
        subtitle={`${fiche.subject ? fiche.subject.name + " · " : ""}${ficheKind(fiche.kind).label}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/bts/fiches/${id}/imprimer`}
              className="btn-secondary"
            >
              <Printer size={15} /> Imprimer
            </Link>
            <Link
              href="/bts/fiches"
              className="text-sm font-medium text-muted hover:text-text hover:underline"
            >
              ← Retour
            </Link>
          </div>
        }
      />

      <FicheActions
        id={fiche.id}
        bookmarked={fiche.bookmarked}
        sourceText={fiche.sourceText}
      />

      {fiche.contentHtml ? (
        <FicheView html={fiche.contentHtml} />
      ) : (
        <Card>
          <p className="text-sm text-muted">
            La fiche n&apos;a pas encore de contenu. Clique sur « Régénérer ».
          </p>
        </Card>
      )}
    </>
  );
}
