import Link from "next/link";
import { Plus, Bookmark, FileText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { auth } from "@/auth";
import { getFiches } from "@/lib/bts";
import { ficheKind } from "@/lib/bts-shared";

export default async function FichesPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <>
        <PageHeader title="Fiches de révision" />
        <Card>
          <EmptyState Icon={FileText} title="Connexion requise" />
        </Card>
      </>
    );
  }

  const fiches = await getFiches();
  const aRevoir = fiches.filter((f) => f.bookmarked);

  return (
    <>
      <PageHeader
        title="Fiches de révision"
        subtitle={
          fiches.length
            ? `${fiches.length} fiche${fiches.length > 1 ? "s" : ""} · ${aRevoir.length} à revoir`
            : "Mets tes cours en fiches avant les DS"
        }
        action={
          <Link href="/bts/fiches/nouvelle" className="btn-primary">
            <Plus size={15} /> Nouvelle fiche
          </Link>
        }
      />

      {fiches.length === 0 ? (
        <Card>
          <EmptyState
            Icon={FileText}
            title="Aucune fiche pour l'instant"
            hint="Colle un cours, choisis un type de fiche, et l'IA te la met en forme (style feuille à carreaux, écritures en couleur)."
            action={
              <Link href="/bts/fiches/nouvelle" className="btn-primary">
                <Plus size={15} /> Créer ma première fiche
              </Link>
            }
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {fiches.map((f) => (
            <li key={f.id}>
              <Link
                href={`/bts/fiches/${f.id}`}
                className="flex items-center gap-3 rounded-field border border-line bg-surface px-4 py-3 hover:bg-surface-2"
                style={{
                  borderLeft: `3px solid ${f.subject?.color ?? "#a78bfa"}`,
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                    {f.bookmarked && (
                      <Bookmark
                        size={13}
                        className="shrink-0 fill-amber-400 text-amber-400"
                      />
                    )}
                    {f.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                    {f.subject ? `${f.subject.name} · ` : ""}
                    {ficheKind(f.kind).label}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-faint">
                  {new Date(f.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
