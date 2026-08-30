"use server";
// Server actions du module Sport.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseFit } from "@/lib/fit";
import { setSportGoal } from "@/lib/sport";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function refresh() {
  revalidatePath("/sport", "layout");
  revalidatePath("/");
}

// Convertit les champs d'un <form> en valeurs typées.
function readForm(fd: FormData) {
  const nOrNull = (k: string) => {
    const v = fd.get(k);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const durMin = nOrNull("durationMin") ?? 0;
  const distKm = nOrNull("distanceKm");
  return {
    date: new Date(`${fd.get("date")}T${fd.get("time") || "12:00"}`),
    type: String(fd.get("type") || "Course"),
    title: String(fd.get("title") || ""),
    durationSec: Math.round(durMin * 60),
    distanceM: distKm != null ? Math.round(distKm * 1000) : null,
    elevationM: nOrNull("elevationM"),
    avgHr: nOrNull("avgHr"),
    maxHr: nOrNull("maxHr"),
    calories: nOrNull("calories"),
    effort: nOrNull("effort"),
    notes: String(fd.get("notes") || ""),
  };
}

export async function createActivity(fd: FormData) {
  await requireAuth();
  await prisma.sportActivity.create({
    data: { ...readForm(fd), source: "manual" },
  });
  refresh();
  redirect("/sport");
}

export async function updateActivity(id: string, fd: FormData) {
  await requireAuth();
  await prisma.sportActivity.update({ where: { id }, data: readForm(fd) });
  refresh();
  redirect(`/sport/${id}`);
}

export async function deleteActivity(id: string) {
  await requireAuth();
  await prisma.sportActivity.delete({ where: { id } });
  refresh();
  redirect("/sport");
}

// Import d'un ou plusieurs fichiers .FIT.
export async function importFitFiles(fd: FormData) {
  await requireAuth();
  const files = fd.getAll("files").filter((f): f is File => f instanceof File);
  let added = 0;
  let skipped = 0;

  for (const file of files) {
    if (!file.name || file.size === 0) continue;
    const bytes = new Uint8Array(await file.arrayBuffer());
    try {
      const parsed = parseFit(bytes);
      const exists = await prisma.sportActivity.findUnique({
        where: { externalId: parsed.externalId },
      });
      if (exists) {
        skipped++;
        continue;
      }
      await prisma.sportActivity.create({
        data: {
          date: parsed.date,
          type: parsed.type,
          title: parsed.title || file.name.replace(/\.fit$/i, ""),
          durationSec: parsed.durationSec,
          distanceM: parsed.distanceM,
          elevationM: parsed.elevationM,
          avgHr: parsed.avgHr,
          maxHr: parsed.maxHr,
          calories: parsed.calories,
          source: "fit",
          externalId: parsed.externalId,
        },
      });
      added++;
    } catch (err) {
      console.error("Import .FIT échoué pour", file.name, err);
    }
  }

  refresh();
  redirect(`/sport?import=${added}-${skipped}`);
}

// Objectif hebdomadaire.
export async function saveSportGoal(fd: FormData) {
  await requireAuth();
  const n = (k: string) => Math.max(0, Math.round(Number(fd.get(k)) || 0));
  await setSportGoal({
    minutes: n("minutes"),
    km: n("km"),
    sessions: n("sessions"),
  });
  revalidatePath("/sport");
}
