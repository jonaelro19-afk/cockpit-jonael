import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getSubject } from "@/lib/bts";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectId } = await params;
  const subject = await getSubject(subjectId);
  if (!subject) notFound();

  return (
    <>
      <PageHeader
        title={subject.name}
        subtitle={`${subject.chapters.length} chapitres`}
        action={
          <Link
            href="/bts"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Toutes les matières
          </Link>
        }
      />

      <div className="space-y-2">
        {subject.chapters.map((c) => (
          <Link
            key={c.id}
            href={`/bts/${subject.id}/${c.id}`}
            className="flex items-center justify-between gap-3 rounded-field border border-line bg-surface px-4 py-3 hover:bg-surface-2"
            style={{ borderLeft: `4px solid ${subject.color}` }}
          >
            <span className="text-sm font-semibold">{c.name}</span>
            <span className="shrink-0 font-mono text-[10px] text-muted">
              {c._count.notions} notion{c._count.notions > 1 ? "s" : ""}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
