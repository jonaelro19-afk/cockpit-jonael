"use server";
// Server actions du sous-module Devis.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextQuoteNumber, nextInvoiceNumber } from "@/lib/mj";
import type { QuoteLineInput } from "@/lib/mj-shared";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function refresh() {
  revalidatePath("/mj", "layout");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function parseLines(fd: FormData): QuoteLineInput[] {
  try {
    const raw = JSON.parse(str(fd, "lines")) as unknown[];
    return raw
      .map((l) => {
        const o = l as Record<string, unknown>;
        return {
          label: String(o.label ?? "").trim(),
          detail: String(o.detail ?? "").trim(),
          quantity: Number(o.quantity) || 0,
          unit: String(o.unit ?? "forfait"),
          unitPrice: Number(o.unitPrice) || 0,
        };
      })
      .filter((l) => l.label !== "");
  } catch {
    return [];
  }
}

export async function saveQuote(fd: FormData) {
  await requireAuth();
  const id = str(fd, "id");
  const lines = parseLines(fd);

  const data = {
    clientId: str(fd, "clientId") || null,
    title: str(fd, "title"),
    issuedAt: str(fd, "issuedAt") ? new Date(str(fd, "issuedAt")) : new Date(),
    validUntil: str(fd, "validUntil") ? new Date(str(fd, "validUntil")) : null,
    status: str(fd, "status") || "Brouillon",
    vatRate: Number(str(fd, "vatRate")) || 0,
    notes: str(fd, "notes"),
  };

  let quoteId = id;
  if (id) {
    await prisma.quote.update({ where: { id }, data });
    await prisma.quoteLine.deleteMany({ where: { quoteId: id } });
  } else {
    const q = await prisma.quote.create({
      data: { ...data, number: await nextQuoteNumber() },
    });
    quoteId = q.id;
  }

  if (lines.length > 0) {
    await prisma.quoteLine.createMany({
      data: lines.map((l, i) => ({ ...l, quoteId, position: i })),
    });
  }

  refresh();
  redirect(`/mj/devis/${quoteId}`);
}

export async function setQuoteStatus(id: string, status: string) {
  await requireAuth();
  await prisma.quote.update({ where: { id }, data: { status } });
  refresh();
}

export async function deleteQuote(id: string) {
  await requireAuth();
  await prisma.quote.delete({ where: { id } });
  refresh();
  redirect("/mj/devis");
}

// Transforme un devis accepté en facture.
export async function convertToInvoice(id: string) {
  await requireAuth();
  const q = await prisma.quote.findUnique({ where: { id } });
  if (!q || q.invoiceNumber) return;
  const due = new Date();
  due.setDate(due.getDate() + 30);
  await prisma.quote.update({
    where: { id },
    data: {
      invoiceNumber: await nextInvoiceNumber(),
      invoicedAt: new Date(),
      dueAt: due,
      status: "Accepté",
    },
  });
  refresh();
  redirect(`/mj/devis/${id}`);
}

export async function setInvoicePaid(id: string, paid: boolean) {
  await requireAuth();
  await prisma.quote.update({
    where: { id },
    data: { paidAt: paid ? new Date() : null },
  });
  refresh();
}

// ---------- Grille de tarifs ----------

export async function addTarif(fd: FormData) {
  await requireAuth();
  const label = str(fd, "label");
  if (!label) return;
  await prisma.tarifItem.create({
    data: {
      label,
      unit: str(fd, "unit") || "forfait",
      unitPrice: Number(str(fd, "unitPrice")) || 0,
      category: str(fd, "category"),
    },
  });
  refresh();
}

export async function deleteTarif(id: string) {
  await requireAuth();
  await prisma.tarifItem.delete({ where: { id } });
  refresh();
}
