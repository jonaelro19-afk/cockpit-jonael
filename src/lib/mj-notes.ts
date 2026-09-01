// Accès aux notes du Mémo M&J.
import { prisma } from "@/lib/prisma";
import { MJ_NOTE_THEMES } from "@/lib/mj-shared";

export * from "@/lib/mj-shared";

export async function getNotesByTheme() {
  const notes = await prisma.mjNote.findMany({
    orderBy: [{ pinned: "desc" }, { order: "asc" }, { updatedAt: "desc" }],
  });
  return MJ_NOTE_THEMES.map((theme) => ({
    theme,
    notes: notes.filter((n) => n.theme === theme),
  })).filter((g) => g.notes.length > 0);
}

export function getNoteCount() {
  return prisma.mjNote.count();
}
