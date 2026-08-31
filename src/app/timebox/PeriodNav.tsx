import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, addMonths, addYears, todayInParis } from "@/lib/date";
import type { TimeboxView } from "@/lib/timebox-shared";

function shift(view: TimeboxView, date: string, dir: -1 | 1): string {
  if (view === "jour") return addDays(date, dir);
  if (view === "semaine") return addDays(date, dir * 7);
  if (view === "mois") return addMonths(date, dir);
  return addYears(date, dir);
}

export default function PeriodNav({
  view,
  date,
}: {
  view: TimeboxView;
  date: string;
}) {
  const today = todayInParis();
  const prev = shift(view, date, -1);
  const next = shift(view, date, 1);
  const link = (d: string) => `/timebox?view=${view}&date=${d}`;

  return (
    <div className="flex items-center gap-1">
      <Link href={link(prev)} className="btn-secondary px-2" aria-label="Précédent">
        <ChevronLeft size={16} />
      </Link>
      <Link href={link(today)} className="btn-secondary">
        Aujourd&apos;hui
      </Link>
      <Link href={link(next)} className="btn-secondary px-2" aria-label="Suivant">
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
