import Link from "next/link";
import { Activity } from "lucide-react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { getHistory, fmtDuration, fmtDistance } from "@/lib/sport";

const typeColor: Record<string, "green" | "blue" | "amber" | "gray"> = {
  Course: "green",
  Vélo: "blue",
  Muscu: "amber",
  Autre: "gray",
};

export default async function HistoriquePage() {
  const activities = await getHistory(200);

  return (
    <>
      <PageHeader
        title="Historique"
        subtitle={`${activities.length} séances`}
        action={
          <Link
            href="/sport"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Sport
          </Link>
        }
      />

      <Card>
        {activities.length === 0 ? (
          <EmptyState
            Icon={Activity}
            title="Aucune séance"
            hint="Tes séances passées apparaîtront ici."
          />
        ) : (
          <ul className="divide-y divide-line">
            {activities.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/sport/${a.id}`}
                  className="flex items-center gap-3 py-3 hover:opacity-80"
                >
                  <span className="w-24 shrink-0 text-xs tabular-nums text-muted">
                    {new Date(a.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </span>
                  <Badge color={typeColor[a.type] ?? "gray"}>{a.type}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm text-text">
                    {a.title || a.type}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {fmtDuration(a.durationSec)}
                    {a.distanceM ? ` · ${fmtDistance(a.distanceM)}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
