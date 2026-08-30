import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Bookmark } from "lucide-react";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import BookmarkButton from "@/components/BookmarkButton";
import { getBookmarkedNotions } from "@/lib/bts";

export default async function ARevoirPage() {
  const notions = await getBookmarkedNotions();

  return (
    <>
      <PageHeader
        title="À revoir"
        subtitle={`${notions.length} notion${notions.length > 1 ? "s" : ""} marquée${
          notions.length > 1 ? "s" : ""
        }`}
        action={
          <Link
            href="/bts"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Carnet
          </Link>
        }
      />

      {notions.length === 0 ? (
        <Card>
          <EmptyState
            Icon={Bookmark}
            title="Rien à revoir"
            hint="Marque une notion « à revoir » (bouton ☆) et elle apparaîtra ici."
          />
        </Card>
      ) : (
        <div className="space-y-2">
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
