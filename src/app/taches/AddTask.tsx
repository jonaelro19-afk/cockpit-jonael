"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createTask } from "./actions";
import { TASK_MODULES, moduleMeta } from "@/lib/tasks-shared";

export default function AddTask({
  defaultModule,
}: {
  defaultModule?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      ref={formRef}
      action={(fd) =>
        start(async () => {
          await createTask(fd);
          formRef.current?.reset();
          setOpen(false);
        })
      }
      className="rounded-card border border-line bg-surface p-3"
    >
      <div className="flex gap-2">
        <input
          name="title"
          required
          placeholder="Nouvelle tâche…"
          onFocus={() => setOpen(true)}
          className="field"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          <Plus size={15} strokeWidth={2} />
        </button>
      </div>
      {open && (
        <div className="mt-2 flex flex-wrap gap-2">
          <input type="date" name="dueDate" className="field w-auto" />
          <select
            name="module"
            defaultValue={defaultModule ?? ""}
            className="field w-auto"
          >
            <option value="">— module —</option>
            {TASK_MODULES.map((m) => (
              <option key={m} value={m}>
                {moduleMeta[m].label}
              </option>
            ))}
          </select>
        </div>
      )}
    </form>
  );
}
