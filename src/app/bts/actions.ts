"use server";
// Server actions du module BTS.

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
