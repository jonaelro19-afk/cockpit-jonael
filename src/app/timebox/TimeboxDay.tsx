"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { TimeBlock, TimeboxCalendar } from "@/lib/types";
import { fromMinutes } from "@/lib/timebox-shared";
import DayGrid from "./DayGrid";
import CreateEventPanel, { type Draft } from "./CreateEventPanel";

export default function TimeboxDay({
  blocks,
  isToday,
  date,
  calendars,
}: {
  blocks: TimeBlock[];
  isToday: boolean;
  date: string;
  calendars: TimeboxCalendar[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);

  const openAt = (startMin: number) =>
    setDraft({
      date,
      start: fromMinutes(startMin),
      end: fromMinutes(startMin + 60),
    });

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted">
          Touche la grille pour ajouter une boîte
        </p>
        <button
          type="button"
          onClick={() => openAt(9 * 60)}
          className="btn-primary"
        >
          <Plus size={15} /> Nouvelle boîte
        </button>
      </div>

      <div className="rounded-card border border-line bg-surface p-3 pr-4">
        <DayGrid blocks={blocks} isToday={isToday} onSlotClick={openAt} />
      </div>

      <CreateEventPanel
        open={draft !== null}
        draft={draft ?? { date, start: "09:00", end: "10:00" }}
        calendars={calendars}
        onClose={() => setDraft(null)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
