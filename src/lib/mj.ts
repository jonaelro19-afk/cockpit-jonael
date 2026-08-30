// Accès aux données du module M&J Production (serveur uniquement).
import { prisma } from "@/lib/prisma";

// Ré-exporte la config/formatage partagés pour que les imports serveur
// existants continuent de marcher (`from "@/lib/mj"`).
export * from "@/lib/mj-shared";

export function getClients() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true } } },
  });
}

export function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { projects: { orderBy: { deadline: "asc" } } },
  });
}

export function getProjects() {
  return prisma.project.findMany({
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    include: { client: true },
  });
}

export function getProject(id: string) {
  return prisma.project.findUnique({ where: { id }, include: { client: true } });
}

export async function getPipeline() {
  const projects = await prisma.project.findMany();
  const active = projects.filter(
    (p) => p.status !== "Livré" && p.status !== "Annulé",
  );
  const delivered = projects.filter((p) => p.status === "Livré");
  const sum = (list: typeof projects) =>
    list.reduce((s, p) => s + (p.budgetEur ?? 0), 0);
  return {
    activeCount: active.length,
    pipelineEur: sum(active),
    deliveredCount: delivered.length,
    deliveredEur: sum(delivered),
  };
}

// ---------- Devis ----------

export function getQuotes() {
  return prisma.quote.findMany({
    orderBy: { issuedAt: "desc" },
    include: { client: true, lines: true },
  });
}

export function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      lines: { orderBy: { position: "asc" } },
    },
  });
}

export function getTarifs() {
  return prisma.tarifItem.findMany({
    orderBy: [{ category: "asc" }, { position: "asc" }, { label: "asc" }],
  });
}

// Prochain numéro : "AAAA-NNN" (NNN remis à 1 chaque année).
export async function nextQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: { number: { startsWith: `${year}-` } },
  });
  return `${year}-${String(count + 1).padStart(3, "0")}`;
}

// Prochain numéro de facture : "FAAAA-NNN".
export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: { invoiceNumber: { startsWith: `F${year}-` } },
  });
  return `F${year}-${String(count + 1).padStart(3, "0")}`;
}

export function getInvoices() {
  return prisma.quote.findMany({
    where: { invoiceNumber: { not: null } },
    orderBy: { invoicedAt: "desc" },
    include: { client: true, lines: true },
  });
}

// Devis seuls (pas encore facturés).
export function getPlainQuotes() {
  return prisma.quote.findMany({
    where: { invoiceNumber: null },
    orderBy: { issuedAt: "desc" },
    include: { client: true, lines: true },
  });
}

export async function getInvoiceStats() {
  const invoices = await prisma.quote.findMany({
    where: { invoiceNumber: { not: null } },
    include: { lines: true },
  });
  const ttc = (q: (typeof invoices)[number]) =>
    q.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0) *
    (1 + q.vatRate / 100);
  let paid = 0;
  let outstanding = 0;
  for (const inv of invoices) {
    if (inv.paidAt) paid += ttc(inv);
    else outstanding += ttc(inv);
  }
  return { count: invoices.length, paid, outstanding };
}

// ---------- Suivi matériel ----------

export async function getEquipment() {
  const all = await prisma.equipment.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  const owned = all.filter((e) => e.status === "possédé");
  const wishlist = all
    .filter((e) => e.status !== "possédé")
    .sort((a, b) => a.priority - b.priority);
  return {
    owned,
    wishlist,
    ownedValue: owned.reduce((s, e) => s + (e.priceEur ?? 0), 0),
    wishlistValue: wishlist.reduce((s, e) => s + (e.priceEur ?? 0), 0),
  };
}

export function getEquipmentItem(id: string) {
  return prisma.equipment.findUnique({ where: { id } });
}
