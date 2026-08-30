"use server";
// Server actions du module M&J : clients + projets.

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
  revalidatePath("/");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const strOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v === "" ? null : v;
};
const dateOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v === "" ? null : new Date(v);
};
const intOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (v === "") return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : null;
};

// ---------- Clients ----------

function clientData(fd: FormData) {
  return {
    name: str(fd, "name"),
    company: strOrNull(fd, "company"),
    email: strOrNull(fd, "email"),
    phone: strOrNull(fd, "phone"),
    address: strOrNull(fd, "address"),
    notes: str(fd, "notes"),
  };
}

export async function createClient(fd: FormData) {
  await requireAuth();
  const c = await prisma.client.create({ data: clientData(fd) });
  refresh();
  redirect(`/mj/clients/${c.id}`);
}

export async function updateClient(id: string, fd: FormData) {
  await requireAuth();
  await prisma.client.update({ where: { id }, data: clientData(fd) });
  refresh();
  redirect(`/mj/clients/${id}`);
}

export async function deleteClient(id: string) {
  await requireAuth();
  await prisma.client.delete({ where: { id } });
  refresh();
  redirect("/mj/clients");
}

// ---------- Projets ----------

function projectData(fd: FormData) {
  return {
    title: str(fd, "title"),
    clientId: strOrNull(fd, "clientId"),
    kind: str(fd, "kind") || "Vidéo",
    status: str(fd, "status") || "Devis",
    shootDate: dateOrNull(fd, "shootDate"),
    deadline: dateOrNull(fd, "deadline"),
    budgetEur: intOrNull(fd, "budgetEur"),
    notes: str(fd, "notes"),
  };
}

export async function createProject(fd: FormData) {
  await requireAuth();
  const p = await prisma.project.create({ data: projectData(fd) });
  refresh();
  redirect(`/mj/projets/${p.id}`);
}

export async function updateProject(id: string, fd: FormData) {
  await requireAuth();
  await prisma.project.update({ where: { id }, data: projectData(fd) });
  refresh();
  redirect(`/mj/projets/${id}`);
}

export async function deleteProject(id: string) {
  await requireAuth();
  await prisma.project.delete({ where: { id } });
  refresh();
  redirect("/mj");
}
