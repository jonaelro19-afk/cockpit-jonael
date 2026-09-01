import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Bookmark, FileText } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import BookmarkButton from "@/components/BookmarkButton";
import { getBookmarkedNotions, getFiches } from "@/lib/bts";
import { ficheKind } from "@/lib/bts-shared";

export default async function ARevoirPage() {
  const [notions, allFiches] = await Promise.all([
    getBookmarkedNotions(),
    getFiches(),
  ]);
  const fiches = allFiches.filter((f) => f.bookmarked);

  return (
    <>
      <PageHeader
        title="À revoir"
        subtitle={`${fiches.length} fiche${fiches.length > 1 ? "s" : ""} · ${notions.length} notion${notions.length > 1 ? "s" : ""}`}
        action={
          <Link
            href="/bts"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Carnet
          </Link>
        }
      />

      {fiches.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
            <FileText size={13} /> Fiches
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {fiches.map((f) => (
              <Link
                key={f.id}
                href={`/bts/fiches/${f.id}`}
                className="rounded-field border border-line bg-surface px-3.5 py-2.5 hover:bg-surface-2"
                style={{
                  borderLeft: `4px solid ${f.subject?.color ?? "#a78bfa"}`,
                }}
              >
                <p className="truncate text-sm font-semibold">{f.title}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                  {f.subject ? `${f.subject.name} · ` : ""}
                  {ficheKind(f.kind).label}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {notions.length === 0 && fiches.length === 0 ? (
        <Card>
          <EmptyState
            Icon={Bookmark}
            title="Rien à revoir"
            hint="Marque une notion ou une fiche « à revoir » et elle apparaîtra ici."
          />
        </Card>
      ) : notions.length === 0 ? null : (
        <div className="space-y-2">
          <h2 className="mb-1 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
            <Bookmark size={13} /> Notions
          </h2>
          {notions.map((n) => (
            <div
              key={n.id}
              className="rounded-field border border-line bg-surface px-3.5 py-2.5"
              style={{ borderLeft: `4px solid ${n.chapter.subject.color}` }}
            >
              <Link href={`/bts/notion/${n.id}`} className="block hover:underline">
                <p className="text-sm font-semibold">{n.term}</p>
                {n.oneliner && (
                  <p className="text-xs text-muted">{n.oneliner}</p>
                )}
              </Link>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                  {n.chapter.subject.name.split(/[/&]/)[0].trim()} › {n.chapter.name}
                </p>
                <BookmarkButton notionId={n.id} initial={n.bookmarked} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
