// Accès aux données du module BTS (base de connaissances).
import { prisma } from "@/lib/prisma";

export async function getSubjectsWithCounts() {
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { _count: { select: { notions: true } } },
      },
    },
  });
  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    chapterCount: s.chapters.length,
    notionCount: s.chapters.reduce((n, c) => n + c._count.notions, 0),
  }));
}

export function getSubject(id: string) {
  return prisma.subject.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { _count: { select: { notions: true } } },
      },
    },
  });
}

export function getChapterById(id: string) {
  return prisma.chapter.findUnique({
    where: { id },
    include: {
      subject: true,
      notions: { orderBy: { order: "asc" } },
    },
  });
}

export function getNotion(id: string) {
  return prisma.notion.findUnique({
    where: { id },
    include: {
      chapter: { include: { subject: true } },
      versions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export function getBookmarkedNotions() {
  return prisma.notion.findMany({
    where: { bookmarked: true },
    orderBy: { updatedAt: "desc" },
    include: { chapter: { include: { subject: true } } },
  });
}

export function getLinks() {
  return prisma.link.findMany({
    orderBy: { order: "asc" },
    include: { subject: true },
  });
}

// ── Fiches de révision ────────────────────────────────────────────

export function getFiches() {
  return prisma.fiche.findMany({
    orderBy: [{ bookmarked: "desc" }, { updatedAt: "desc" }],
    include: { subject: true },
  });
}

export function getRecentFiches(take = 4) {
  return prisma.fiche.findMany({
    orderBy: { updatedAt: "desc" },
    take,
    include: { subject: true },
  });
}

export function getFiche(id: string) {
  return prisma.fiche.findUnique({
    where: { id },
    include: { subject: true },
  });
}

export function getSubjectsSimple() {
  return prisma.subject.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, color: true },
  });
}

// Recherche plein-texte simple : terme + résumé + contenu (balises retirées).
export async function searchNotions(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await prisma.notion.findMany({
    include: { chapter: { include: { subject: true } } },
  });
  return all
    .filter((n) => {
      const blob = `${n.term} ${n.oneliner} ${n.contentHtml.replace(
        /<[^>]+>/g,
        " ",
      )}`.toLowerCase();
      return blob.includes(q);
    })
    .slice(0, 20);
}
