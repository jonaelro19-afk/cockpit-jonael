"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function refresh() {
  revalidatePath("/taches");
  revalidatePath("/");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createTask(fd: FormData) {
  await requireAuth();
  const title = str(fd, "title");
  if (!title) return;
  const due = str(fd, "dueDate");
  await prisma.task.create({
    data: {
      title,
      dueDate: due ? new Date(due) : null,
      module: str(fd, "module") || null,
      notes: str(fd, "notes"),
    },
  });
  refresh();
}

export async function toggleTask(id: string, done: boolean) {
  await requireAuth();
  await prisma.task.update({
    where: { id },
    data: { done, doneAt: done ? new Date() : null },
  });
  refresh();
}

export async function updateTask(id: string, fd: FormData) {
  await requireAuth();
  const due = str(fd, "dueDate");
  await prisma.task.update({
    where: { id },
    data: {
      title: str(fd, "title"),
      dueDate: due ? new Date(due) : null,
      module: str(fd, "module") || null,
      notes: str(fd, "notes"),
    },
  });
  refresh();
}

export async function deleteTask(id: string) {
  await requireAuth();
  await prisma.task.delete({ where: { id } });
  refresh();
}

// Efface toutes les tâches terminées.
export async function clearDoneTasks() {
  await requireAuth();
  await prisma.task.deleteMany({ where: { done: true } });
  refresh();
}
