"use client";
// Une ligne du tableau des calendriers. Cliquer la case ou changer la
// catégorie appelle une server action ; useTransition affiche l'état "…".

import { useTransition } from "react";
import { toggleTimebox, setCategory } from "./actions";
import type { BlockCategory } from "@/lib/types";

const CATEGORIES: BlockCategory[] = [
  "BTS",
  "Sport",
  "M&J",
  "Perso",
  "Pause",
  "Cours",
];

type Props = {
  id: string;
  label: string;
  category: string;
  includeInTimebox: boolean;
  active: boolean;
};

export default function CalendarRow({
  id,
  label,
  category,
  includeInTimebox,
  active,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className={active ? "" : "opacity-40"}>
      <td className="py-2 pr-4 font-medium text-text">
        {label}
        {!active && <span className="ml-2 text-xs text-muted">(inactif)</span>}
      </td>
      <td className="py-2 pr-4 text-center">
        <input
          type="checkbox"
          checked={includeInTimebox}
          disabled={pending}
          onChange={(e) =>
            startTransition(() => toggleTimebox(id, e.target.checked))
          }
          className="h-4 w-4 accent-white"
        />
      </td>
      <td className="py-2">
        <select
          value={category}
          disabled={pending}
          onChange={(e) => startTransition(() => setCategory(id, e.target.value))}
          className="field w-auto py-1"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
