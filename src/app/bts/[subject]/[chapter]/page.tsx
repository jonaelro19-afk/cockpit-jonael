import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import NotionContent from "@/components/NotionContent";
import BookmarkButton from "@/components/BookmarkButton";
import { getChapterById } from "@/lib/bts";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ subject: string; chapter: string }>;
}) {
  const { chapter: chapterId } = await params;
  const chapter = await getChapterById(chapterId);
  if (!chapter) notFound();

  return (
    <>
      <PageHeader
        title={chapter.name}
        subtitle={chapter.subject.name}
        action={
          <Link
            href={`/bts/${chapter.subjectId}`}
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← {chapter.subject.name}
          </Link>
        }
      />

      <div className="space-y-2.5">
        {chapter.notions.map((n) => (
          <details
            key={n.id}
            id={n.slug}
            className="group rounded-field border border-line bg-surface"
            style={{ borderLeft: `3px solid ${chapter.subject.color}` }}
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3">
              <span className="text-xs text-muted transition-transform group-open:rotate-90">
                ▶
              </span>
              <span className="text-sm font-semibold text-text">{n.term}</span>
              {n.oneliner && (
                <span className="ml-auto hidden max-w-[40%] truncate text-right text-xs text-muted sm:block">
                  {n.oneliner}
                </span>
              )}
            </summary>
            <div className="border-t border-dashed border-line px-4 py-3 pl-10">
              <NotionContent html={n.contentHtml} />
              <div className="mt-3 flex items-center gap-3">
                <BookmarkButton notionId={n.id} initial={n.bookmarked} />
                <Link
                  href={`/bts/notion/${n.id}`}
                  className="font-mono text-[11px] text-muted hover:text-text hover:underline"
                >
                  pleine page →
                </Link>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
