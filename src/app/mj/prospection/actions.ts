"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  PROSPECT_STATUSES,
  PROSPECT_SEGMENTS,
  PROSPECT_PRIORITIES,
  INTERACTION_KINDS,
} from "@/lib/prospection-shared";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

const num = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : null;
};
const date = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s ? new Date(s) : null;
};
const oneOf = (v: FormDataEntryValue | null, list: readonly string[], def: string) => {
  const s = String(v ?? "").trim();
  return list.includes(s) ? s : def;
};

function readProspect(fd: FormData) {
  return {
    name: String(fd.get("name") ?? "").trim(),
    segment: oneOf(fd.get("segment"), PROSPECT_SEGMENTS, "Autre"),
    contactName: String(fd.get("contactName") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    address: String(fd.get("address") ?? "").trim(),
    website: String(fd.get("website") ?? "").trim(),
    sector: String(fd.get("sector") ?? "").trim(),
    headcount: num(fd.get("headcount")),
    budgetEur: num(fd.get("budgetEur")),
    eventsPerYear: num(fd.get("eventsPerYear")),
    firstContact: date(fd.get("firstContact")),
    lastContact: date(fd.get("lastContact")),
    status: oneOf(fd.get("status"), PROSPECT_STATUSES, "À contacter"),
    priority: oneOf(fd.get("priority"), PROSPECT_PRIORITIES, "normale"),
    notes: String(fd.get("notes") ?? "").trim(),
  };
}

export async function createProspect(fd: FormData) {
  await requireAuth();
  const data = readProspect(fd);
  if (!data.name) return;
  const p = await prisma.prospect.create({ data });
  revalidatePath("/mj/prospection");
  redirect(`/mj/prospection/${p.id}`);
}

export async function updateProspect(id: string, fd: FormData) {
  await requireAuth();
  const data = readProspect(fd);
  if (!data.name) return;
  await prisma.prospect.update({ where: { id }, data });
  revalidatePath("/mj/prospection");
  revalidatePath(`/mj/prospection/${id}`);
}

export async function setProspectStatus(id: string, status: string) {
  await requireAuth();
  if (!PROSPECT_STATUSES.includes(status as never)) return;
  await prisma.prospect.update({ where: { id }, data: { status } });
  revalidatePath("/mj/prospection");
  revalidatePath(`/mj/prospection/${id}`);
}

export async function deleteProspect(id: string) {
  await requireAuth();
  await prisma.prospect.delete({ where: { id } });
  revalidatePath("/mj/prospection");
  redirect("/mj/prospection");
}

export async function addInteraction(prospectId: string, fd: FormData) {
  await requireAuth();
  const summary = String(fd.get("summary") ?? "").trim();
  const when = date(fd.get("date")) ?? new Date();
  const interaction = {
    prospectId,
    date: when,
    kind: oneOf(fd.get("kind"), INTERACTION_KINDS, "Appel"),
    who: String(fd.get("who") ?? "").trim(),
    summary,
    nextAt: date(fd.get("nextAt")),
  };
  await prisma.$transaction([
    prisma.prospectInteraction.create({ data: interaction }),
    // Un échange met à jour "dernier contact".
    prisma.prospect.update({
      where: { id: prospectId },
      data: { lastContact: when },
    }),
  ]);
  revalidatePath(`/mj/prospection/${prospectId}`);
  revalidatePath("/mj/prospection");
}

export async function deleteInteraction(id: string, prospectId: string) {
  await requireAuth();
  await prisma.prospectInteraction.delete({ where: { id } });
  revalidatePath(`/mj/prospection/${prospectId}`);
}
