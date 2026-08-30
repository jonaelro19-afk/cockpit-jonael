"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { toggleTask, updateTask, deleteTask } from "./actions";
import { TASK_MODULES, moduleMeta } from "@/lib/tasks-shared";
import type { Task } from "@/generated/prisma/client";

function fmtDue(d: Date | string): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
function isLate(d: Date | string): boolean {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return x < t;
}

export default function TaskItem({ task }: { task: Task }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const meta = task.module ? moduleMeta[task.module] : null;

  if (editing) {
    return (
      <li className="py-2">
        <form
          action={(fd) =>
            start(async () => {
              await updateTask(task.id, fd);
              setEditing(false);
            })
          }
          className="flex flex-wrap items-center gap-2"
        >
          <input
            name="title"
            defaultValue={task.title}
            required
            className="field flex-1"
          />
          <input
            type="date"
            name="dueDate"
            defaultValue={
              task.dueDate
                ? new Date(task.dueDate).toISOString().slice(0, 10)
                : ""
            }
            className="field w-auto"
          />
          <select
            name="module"
            defaultValue={task.module ?? ""}
            className="field w-auto"
          >
            <option value="">— module —</option>
            {TASK_MODULES.map((m) => (
              <option key={m} value={m}>
                {moduleMeta[m].label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary" disabled={pending}>
            <Check size={15} />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="btn-ghost"
          >
            <X size={15} />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center gap-3 py-2 transition-opacity ${
        pending ? "opacity-40" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => start(() => toggleTask(task.id, !task.done))}
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
          task.done
            ? "border-online bg-online text-black"
            : "border-line hover:border-white/40"
        }`}
        aria-label={task.done ? "Rouvrir" : "Terminer"}
      >
        {task.done && <Check size={13} strokeWidth={3} />}
      </button>

      {meta && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: meta.color }}
          title={meta.label}
        />
      )}

      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          task.done ? "text-muted line-through" : "text-text"
        }`}
      >
        {task.link ? (
          <Link href={task.link} className="hover:underline">
            {task.title}
          </Link>
        ) : (
          task.title
        )}
      </span>

      {task.dueDate && !task.done && (
        <span
          className={`shrink-0 text-xs ${
            isLate(task.dueDate) ? "text-live" : "text-muted"
          }`}
        >
          {fmtDue(task.dueDate)}
        </span>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          aria-label="Modifier"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={() => start(() => deleteTask(task.id))}
          className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-live"
          aria-label="Supprimer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}
