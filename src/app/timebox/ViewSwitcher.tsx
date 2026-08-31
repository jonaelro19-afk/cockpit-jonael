import Link from "next/link";
import { VIEWS, type TimeboxView } from "@/lib/timebox-shared";

const LABEL: Record<TimeboxView, string> = {
  jour: "Jour",
  semaine: "Semaine",
  mois: "Mois",
  annee: "Année",
};

export default function ViewSwitcher({
  view,
  date,
}: {
  view: TimeboxView;
  date: string;
}) {
  return (
    <div className="flex rounded-pill border border-line bg-surface p-0.5 text-xs">
      {VIEWS.map((v) => (
        <Link
          key={v}
          href={`/timebox?view=${v}&date=${date}`}
          className={`rounded-pill px-3 py-1.5 font-medium transition-colors ${
            v === view
              ? "bg-accent text-accent-fg"
              : "text-muted hover:text-text"
          }`}
        >
          {LABEL[v]}
        </Link>
      ))}
    </div>
  );
}
