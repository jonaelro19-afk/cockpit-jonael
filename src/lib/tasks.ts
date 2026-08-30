// Accès aux tâches transverses + regroupement par échéance (serveur).
import { prisma } from "@/lib/prisma";
import type { Task } from "@/generated/prisma/client";

export * from "@/lib/tasks-shared";

export function getTasks() {
  return prisma.task.findMany({
    orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export function getOpenTaskCount() {
  return prisma.task.count({ where: { done: false } });
}

export async function getUpcomingTasks(limit = 6) {
  const tasks = await prisma.task.findMany({
    where: { done: false },
    orderBy: { createdAt: "desc" },
  });
  return sortByUrgency(tasks).slice(0, limit);
}

// null due date = le moins urgent
function dueValue(t: Task): number {
  return t.dueDate ? new Date(t.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
}
export function sortByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => dueValue(a) - dueValue(b));
}

export type TaskGroup = {
  key: string;
  label: string;
  tasks: Task[];
};

export function groupTasks(tasks: Task[]): TaskGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today.getTime() + 7 * 86400000);

  const open = sortByUrgency(tasks.filter((t) => !t.done));
  const done = tasks
    .filter((t) => t.done)
    .sort(
      (a, b) =>
        new Date(b.doneAt ?? b.updatedAt).getTime() -
        new Date(a.doneAt ?? a.updatedAt).getTime(),
    );

  const buckets: Record<string, Task[]> = {
    retard: [],
    aujourdhui: [],
    semaine: [],
    plus_tard: [],
    sans_date: [],
  };
  for (const t of open) {
    if (!t.dueDate) buckets.sans_date.push(t);
    else {
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      if (d < today) buckets.retard.push(t);
      else if (d.getTime() === today.getTime()) buckets.aujourdhui.push(t);
      else if (d < in7) buckets.semaine.push(t);
      else buckets.plus_tard.push(t);
    }
  }

  const groups: TaskGroup[] = [
    { key: "retard", label: "En retard", tasks: buckets.retard },
    { key: "aujourdhui", label: "Aujourd'hui", tasks: buckets.aujourdhui },
    { key: "semaine", label: "Cette semaine", tasks: buckets.semaine },
    { key: "plus_tard", label: "Plus tard", tasks: buckets.plus_tard },
    { key: "sans_date", label: "Sans échéance", tasks: buckets.sans_date },
  ].filter((g) => g.tasks.length > 0);

  if (done.length > 0)
    groups.push({ key: "done", label: "Terminées", tasks: done.slice(0, 30) });

  return groups;
}
