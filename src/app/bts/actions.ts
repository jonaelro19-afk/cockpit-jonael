"use server";
// Server actions du module BTS.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateFiche } from "@/lib/ai/fiche";
import { AiError } from "@/lib/ai/llm";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

// Marque / démarque une notion comme « à revoir ».
export async function toggleBookmark(notionId: string, value: boolean) {
  await requireAuth();
  await prisma.notion.update({
    where: { id: notionId },
    data: { bookmarked: value },
  });
  revalidatePath("/bts", "layout");
  revalidatePath("/");
}

// ── Fiches de révision ────────────────────────────────────────────

export type FicheFormState = { error: string } | null;

export async function createFiche(
  _prev: FicheFormState,
  fd: FormData,
): Promise<FicheFormState> {
  await requireAuth();

  const title = String(fd.get("title") ?? "").trim();
  const kind = String(fd.get("kind") ?? "Synthèse").trim();
  const subjectId = String(fd.get("subjectId") ?? "").trim() || null;
  const sourceText = String(fd.get("sourceText") ?? "").trim();

  if (!title) return { error: "Donne un titre à la fiche." };
  if (sourceText.length < 40)
    return { error: "Colle d'abord ton cours (au moins quelques phrases)." };

  const subject = subjectId
    ? await prisma.subject.findUnique({ where: { id: subjectId } })
    : null;

  let contentHtml: string;
  try {
    contentHtml = await generateFiche({
      title,
      kind,
      subjectName: subject?.name,
      sourceText,
    });
  } catch (err) {
    if (err instanceof AiError && err.kind === "no-key")
      return {
        error:
          "L'IA n'est pas encore configurée : ajoute GEMINI_API_KEY (gratuit) dans les variables Vercel.",
      };
    console.error("createFiche", err);
    return { error: "La génération a échoué. Réessaie dans un instant." };
  }

  const fiche = await prisma.fiche.create({
    data: { title, kind, subjectId, sourceText, contentHtml },
  });

  revalidatePath("/bts", "layout");
  redirect(`/bts/fiches/${fiche.id}`);
}

export async function regenerateFiche(id: string) {
  await requireAuth();
  const fiche = await prisma.fiche.findUnique({
    where: { id },
    include: { subject: true },
  });
  if (!fiche) return;

  const contentHtml = await generateFiche({
    title: fiche.title,
    kind: fiche.kind,
    subjectName: fiche.subject?.name,
    sourceText: fiche.sourceText,
  });
  await prisma.fiche.update({ where: { id }, data: { contentHtml } });
  revalidatePath("/bts", "layout");
}

export async function updateFicheSource(id: string, sourceText: string) {
  await requireAuth();
  const clean = sourceText.trim();
  await prisma.fiche.update({ where: { id }, data: { sourceText: clean } });
  const fiche = await prisma.fiche.findUnique({
    where: { id },
    include: { subject: true },
  });
  if (fiche && clean.length >= 40) {
    const contentHtml = await generateFiche({
      title: fiche.title,
      kind: fiche.kind,
      subjectName: fiche.subject?.name,
      sourceText: clean,
    });
    await prisma.fiche.update({ where: { id }, data: { contentHtml } });
  }
  revalidatePath("/bts", "layout");
}

export async function toggleFicheBookmark(id: string, value: boolean) {
  await requireAuth();
  await prisma.fiche.update({ where: { id }, data: { bookmarked: value } });
  revalidatePath("/bts", "layout");
  revalidatePath("/");
}

export async function deleteFiche(id: string) {
  await requireAuth();
  await prisma.fiche.delete({ where: { id } });
  revalidatePath("/bts", "layout");
  redirect("/bts/fiches");
}

// ── Nouvelle matière ─────────────────────────────────────────────

export async function createSubject(
  _prev: { error: string } | null,
  fd: FormData,
): Promise<{ error: string } | null> {
  await requireAuth();
  const id = String(fd.get("id") ?? "").trim().toUpperCase();
  const name = String(fd.get("name") ?? "").trim();
  const color = String(fd.get("color") ?? "#a78bfa").trim();

  if (!/^[A-Z0-9]{2,8}$/.test(id))
    return { error: "Code matière : 2 à 8 lettres/chiffres (ex : MECA, AII)." };
  if (!name) return { error: "Donne un nom à la matière." };

  const exists = await prisma.subject.findUnique({ where: { id } });
  if (exists) return { error: `Le code « ${id} » existe déjà.` };

  const count = await prisma.subject.count();
  await prisma.subject.create({
    data: { id, name, color, order: count },
  });
  revalidatePath("/bts", "layout");
  redirect(`/bts/${id}`);
}
