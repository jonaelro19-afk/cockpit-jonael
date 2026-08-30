// Navigation entre les jours (‹ / Aujourd'hui / ›).
// De simples liens : changer l'URL ?date=... recharge la page côté serveur.

import Link from "next/link";
import { addDays, todayInParis } from "@/lib/date";

export default function DayNav({ date }: { date: string }) {
  const prev = addDays(date, -1);
  const next = addDays(date, 1);
  const today = todayInParis();

  const btn =
    "btn-secondary";

  return (
    <div className="flex items-center gap-2">
      <Link href={`/timebox?date=${prev}`} className={btn} aria-label="Jour précédent">
        ‹
      </Link>
      {date !== today && (
        <Link href="/timebox" className={btn}>
          Aujourd&apos;hui
        </Link>
      )}
      <Link href={`/timebox?date=${next}`} className={btn} aria-label="Jour suivant">
        ›
      </Link>
    </div>
  );
}
