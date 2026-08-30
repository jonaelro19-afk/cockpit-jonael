/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { CalendarDays, Info } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import CalendarRow from "./CalendarRow";
import ResyncButton from "./ResyncButton";
import { SignOutButton } from "@/components/SignInWithGoogle";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ParametresPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const sources = await prisma.calendarSource.findMany({
    orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { label: "asc" }],
  });

  return (
    <>
      <PageHeader title="Paramètres" subtitle="Compte, calendriers, à propos" />

      {/* Profil */}
      <Card className="mb-5">
        <div className="flex items-center gap-4">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-lg font-semibold text-muted">
              {(session.user.name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {session.user.name ?? "Compte Google"}
            </p>
            <p className="truncate text-sm text-muted">{session.user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </Card>

      {/* Calendriers */}
      <Card
        title="Calendriers Google"
        action={<ResyncButton />}
        className="mb-5"
      >
        <p className="mb-4 flex items-center gap-2 text-xs text-muted">
          <CalendarDays size={14} />
          Coche les calendriers à afficher dans la Timebox et choisis leur
          catégorie.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">Calendrier</th>
                <th className="py-2 pr-4 font-medium">Timebox</th>
                <th className="py-2 font-medium">Catégorie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sources.map((s) => (
                <CalendarRow
                  key={s.id}
                  id={s.id}
                  label={s.label}
                  category={s.category}
                  includeInTimebox={s.includeInTimebox}
                  active={s.active}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* À propos */}
      <Card title="À propos">
        <div className="flex items-start gap-3 text-sm text-muted">
          <Info size={16} className="mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p>
              Cockpit personnel — Next.js, Tailwind, base SQLite locale. Thème
              sombre.
            </p>
            <p>
              Modules : Timebox (Google Agenda), BTS (carnet de notions), Sport
              (.FIT / manuel), M&J Production (projets, devis, matériel), Gmail.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
