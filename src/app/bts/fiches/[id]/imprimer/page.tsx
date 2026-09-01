import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PrintButton from "./PrintButton";
import FicheView from "../../FicheView";
import { auth } from "@/auth";
import { getFiche } from "@/lib/bts";

export default async function FichePrintPage({
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-3 print:hidden">
        <PrintButton />
        <Link
          href={`/bts/fiches/${id}`}
          className="text-sm font-medium text-muted hover:text-text hover:underline"
        >
          ← Retour à la fiche
        </Link>
      </div>
      <FicheView html={fiche.contentHtml} />
    </div>
  );
}
