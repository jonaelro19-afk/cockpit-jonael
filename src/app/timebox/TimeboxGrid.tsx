"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { TimeBlock, TimeboxCalendar } from "@/lib/types";
import { fromMinutes } from "@/lib/timebox-shared";
import ColumnsGrid, { type GridColumn } from "./ColumnsGrid";
import CreateEventPanel, { type Draft } from "./CreateEventPanel";

export default function TimeboxGrid({
  columns,
  blocks,
  calendars,
  defaultDate,
}: {
  columns: GridColumn[];
  blocks: TimeBlock[];
  calendars: TimeboxCalendar[];
  defaultDate: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);

  const openAt = (date: string, startMin: number) =>
    setDraft({
      date,
      start: fromMinutes(startMin),
      end: fromMinutes(startMin + 60),
    });

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="hidden text-xs text-muted sm:block">
          Touche la grille pour ajouter une boîte
        </p>
        <button
          type="button"
          onClick={() => openAt(defaultDate, 9 * 60)}
          className="btn-primary ml-auto"
        >
          <Plus size={15} /> Nouvelle boîte
        </button>
      </div>

      <div className="rounded-card border border-line bg-surface p-3 pr-4">
        <ColumnsGrid columns={columns} blocks={blocks} onSlotClick={openAt} />
      </div>

      <CreateEventPanel
        open={draft !== null}
        draft={draft ?? { date: defaultDate, start: "09:00", end: "10:00" }}
        calendars={calendars}
        onClose={() => setDraft(null)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
