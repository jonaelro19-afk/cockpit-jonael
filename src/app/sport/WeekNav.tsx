import Link from "next/link";
import { addDays, mondayOf, todayInParis } from "@/lib/date";

// Navigation de semaine en semaine (?w=<date dans la semaine>).
export default function WeekNav({ monday }: { monday: string }) {
  const prev = addDays(monday, -7);
  const next = addDays(monday, 7);
  const thisWeek = mondayOf(todayInParis());

  const btn =
    "btn-secondary";

  return (
    <div className="flex items-center gap-2">
      <Link href={`/sport?w=${prev}`} className={btn} aria-label="Semaine précédente">
        ‹
      </Link>
      {monday !== thisWeek && (
        <Link href="/sport" className={btn}>
          Cette semaine
        </Link>
      )}
      <Link href={`/sport?w=${next}`} className={btn} aria-label="Semaine suivante">
        ›
      </Link>
    </div>
  );
}
