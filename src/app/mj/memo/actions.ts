"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MJ_NOTE_THEMES } from "@/lib/mj-shared";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function cleanTheme(v: string): string {
  return (MJ_NOTE_THEMES as readonly string[]).includes(v) ? v : "Ressources";
}

export async function createNote(fd: FormData) {
  await requireAuth();
  const title = String(fd.get("title") ?? "").trim();
  const theme = cleanTheme(String(fd.get("theme") ?? ""));
  const body = String(fd.get("body") ?? "").trim();
  if (!title) return;
  const max = await prisma.mjNote.aggregate({
    where: { theme },
    _max: { order: true },
  });
  await prisma.mjNote.create({
    data: { title, theme, body, order: (max._max.order ?? 0) + 1 },
  });
  revalidatePath("/mj/memo");
}

export async function updateNote(id: string, fd: FormData) {
  await requireAuth();
  const title = String(fd.get("title") ?? "").trim();
  const theme = cleanTheme(String(fd.get("theme") ?? ""));
  const body = String(fd.get("body") ?? "").trim();
  if (!title) return;
  await prisma.mjNote.update({ where: { id }, data: { title, theme, body } });
  revalidatePath("/mj/memo");
}

export async function togglePin(id: string, pinned: boolean) {
  await requireAuth();
  await prisma.mjNote.update({ where: { id }, data: { pinned } });
  revalidatePath("/mj/memo");
}

export async function deleteNote(id: string) {
  await requireAuth();
  await prisma.mjNote.delete({ where: { id } });
  revalidatePath("/mj/memo");
}
