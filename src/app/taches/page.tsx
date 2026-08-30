import { ListChecks } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import AddTask from "./AddTask";
import TaskItem from "./TaskItem";
import ClearDone from "./ClearDone";
import { getTasks, groupTasks } from "@/lib/tasks";

export default async function TachesPage() {
  const tasks = await getTasks();
  const groups = groupTasks(tasks);
  const openCount = tasks.filter((t) => !t.done).length;
  const hasDone = tasks.some((t) => t.done);

  return (
    <>
      <PageHeader
        title="Tâches"
        subtitle={`${openCount} à faire`}
        action={hasDone ? <ClearDone /> : undefined}
      />

      <div className="mb-5">
        <AddTask />
      </div>

      {tasks.length === 0 ? (
        <Card>
          <EmptyState
            Icon={ListChecks}
            title="Aucune tâche"
            hint="Ajoute ce que tu dois faire — devoirs BTS, relances clients, courses…"
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <Card
              key={g.key}
              title={`${g.label} — ${g.tasks.length}`}
              className={g.key === "retard" ? "border-live/40" : ""}
            >
              <ul className="divide-y divide-line">
                {g.tasks.map((t) => (
                  <TaskItem key={t.id} task={t} />
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
