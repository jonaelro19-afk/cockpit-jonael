import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import NotionContent from "@/components/NotionContent";
import BookmarkButton from "@/components/BookmarkButton";
import { getNotion } from "@/lib/bts";

export default async function NotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notion = await getNotion(id);
  if (!notion) notFound();

  const { chapter } = notion;

  return (
    <>
      <PageHeader
        title={notion.term}
        subtitle={notion.oneliner}
        action={
          <Link
            href={`/bts/${chapter.subjectId}/${chapter.id}`}
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← {chapter.name}
          </Link>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
          {chapter.subject.name} › {chapter.name}
        </p>
        <BookmarkButton notionId={notion.id} initial={notion.bookmarked} />
      </div>

      <Card>
        <NotionContent html={notion.contentHtml} />
      </Card>
    </>
  );
}
