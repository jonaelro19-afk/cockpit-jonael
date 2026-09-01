import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import MjTabs from "../MjTabs";
import AddNote from "./AddNote";
import MemoNote from "./MemoNote";
import { auth } from "@/auth";
import { getNotesByTheme } from "@/lib/mj-notes";
import { mjThemeColor } from "@/lib/mj-shared";
import { renderMdLite } from "@/lib/md-lite";
import "./memo.css";

export default async function MemoPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const groups = await getNotesByTheme();
  const total = groups.reduce((n, g) => n + g.notes.length, 0);

  return (
    <>
      <PageHeader
        title="M&J Prod"
        subtitle="Mémo — la base de connaissances de l'agence"
        action={<AddNote />}
      />
      <MjTabs />

      <p className="mb-5 text-xs text-muted">
        Tout ce qui doit guider chaque projet : la niche, comment approcher un
        client, la méthode de devis, la technique. {total} note
        {total > 1 ? "s" : ""}.
      </p>

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            Icon={BookOpen}
            title="Aucune note"
            hint="Ajoute la niche, la méthode de devis, tes scripts d'appel… et l'IA s'en servira pour chaque devis et chaque proposition."
          />
        </Card>
      ) : (
        <div className="space-y-7">
          {groups.map((g) => (
            <section key={g.theme}>
              <h2
                className="mb-2 flex items-center gap-2 border-b border-line pb-1.5 text-sm font-bold uppercase tracking-wide"
                style={{ color: mjThemeColor[g.theme] ?? "#9a9a9e" }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: mjThemeColor[g.theme] ?? "#9a9a9e" }}
                />
                {g.theme}
                <span className="text-xs font-normal text-faint">
                  {g.notes.length}
                </span>
              </h2>
              <ul className="space-y-2">
                {g.notes.map((n) => (
                  <MemoNote
                    key={n.id}
                    note={{
                      id: n.id,
                      theme: n.theme,
                      title: n.title,
                      body: n.body,
                      pinned: n.pinned,
                    }}
                    html={renderMdLite(n.body)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
