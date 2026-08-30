"use server";
// Server actions du sous-module Suivi matériel.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function refresh() {
  revalidatePath("/mj", "layout");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const nn = (fd: FormData, k: string) => (str(fd, k) === "" ? null : str(fd, k));
const int = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (v === "") return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : null;
};

function data(fd: FormData) {
  return {
    name: str(fd, "name"),
    category: str(fd, "category") || "Autre",
    status: str(fd, "status") || "possédé",
    reference: nn(fd, "reference"),
    condition: nn(fd, "condition"),
    priceEur: int(fd, "priceEur"),
    priority: int(fd, "priority") ?? 2,
    url: nn(fd, "url"),
    purchasedAt: str(fd, "purchasedAt") ? new Date(str(fd, "purchasedAt")) : null,
    notes: str(fd, "notes"),
  };
}

export async function createEquipment(fd: FormData) {
  await requireAuth();
  const e = await prisma.equipment.create({ data: data(fd) });
  refresh();
  redirect(`/mj/suivi/${e.id}`);
}

export async function updateEquipment(id: string, fd: FormData) {
  await requireAuth();
  await prisma.equipment.update({ where: { id }, data: data(fd) });
  refresh();
  redirect(`/mj/suivi/${id}`);
}

export async function deleteEquipment(id: string) {
  await requireAuth();
  await prisma.equipment.delete({ where: { id } });
  refresh();
  redirect("/mj/suivi");
}

// Passe un article de la liste d'achats à l'inventaire "possédé".
export async function markPurchased(id: string) {
  await requireAuth();
  await prisma.equipment.update({
    where: { id },
    data: { status: "possédé", purchasedAt: new Date() },
  });
  refresh();
}
