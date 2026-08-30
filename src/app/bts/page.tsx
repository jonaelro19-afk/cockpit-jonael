import Link from "next/link";
import { Search, Bookmark, Link2, SearchX } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import {
  getSubjectsWithCounts,
  getLinks,
  searchNotions,
  getBookmarkedNotions,
} from "@/lib/bts";

export default async function BtsHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [subjects, links, bookmarked, results] = await Promise.all([
    getSubjectsWithCounts(),
    getLinks(),
    getBookmarkedNotions(),
    query ? searchNotions(query) : Promise.resolve([]),
  ]);

  const totalNotions = subjects.reduce((s, x) => s + x.notionCount, 0);

  return (
    <>
      <PageHeader
        title="Carnet de notions"
        subtitle={`${subjects.length} matières · ${totalNotions} notions`}
        action={
          <Link href="/bts/a-revoir" className="btn-secondary">
            <Bookmark size={15} strokeWidth={2} />
            {bookmarked.length}
          </Link>
        }
      />

      <form className="relative mb-6">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Rechercher une notion (Karnaugh, transition, ALI…)"
          className="field pl-10"
        />
      </form>

      {query ? (
        <SearchResults query={query} results={results} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/bts/${s.id}`}
                className="group rounded-card border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
              >
                <span
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl font-mono text-[11px] font-bold"
                  style={{ background: `${s.color}22`, color: s.color }}
                >
                  {s.id}
                </span>
                <p className="text-sm font-semibold leading-tight">{s.name}</p>
                <p className="mt-2 font-mono text-[10px] text-muted">
                  {s.chapterCount} chap · {s.notionCount} notions
                </p>
              </Link>
            ))}
          </div>

          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 border-b border-line pb-1.5 font-mono text-xs uppercase tracking-wider text-muted">
              <Link2 size={13} /> Liens utiles
            </h2>
            {links.length === 0 ? (
              <p className="py-3 text-sm text-muted">
                Aucun lien pour l&apos;instant.
              </p>
            ) : (
              <div className="space-y-2">
                {links.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-field border border-line bg-surface px-3.5 py-2.5 hover:bg-surface-2"
                    style={{
                      borderLeft: `3px solid ${l.subject?.color ?? "#94a3b8"}`,
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{l.name}</p>
                      {l.description && (
                        <p className="truncate text-xs text-muted">
                          {l.description}
                        </p>
                      )}
                    </div>
                    {l.subject && (
                      <span className="chip bg-surface-2 font-mono text-[10px] text-muted">
                        {l.subject.id}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

function SearchResults({
  query,
  results,
}: {
  query: string;
  results: Awaited<ReturnType<typeof searchNotions>>;
}) {
  if (results.length === 0) {
    return (
      <Card>
        <EmptyState
          Icon={SearchX}
          title={`Aucune notion pour « ${query} »`}
          hint="Essaie un autre terme, ou parcours les matières."
        />
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        {results.length} résultat{results.length > 1 ? "s" : ""}
      </p>
      {results.map((n) => (
        <Link
          key={n.id}
          href={`/bts/notion/${n.id}`}
          className="block rounded-field border border-line bg-surface px-3.5 py-2.5 hover:bg-surface-2"
          style={{ borderLeft: `3px solid ${n.chapter.subject.color}` }}
        >
          <p className="text-sm font-semibold">{n.term}</p>
          {n.oneliner && <p className="text-xs text-muted">{n.oneliner}</p>}
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">
            {n.chapter.subject.name.split(/[/&]/)[0].trim()} › {n.chapter.name}
          </p>
        </Link>
      ))}
    </div>
  );
}
