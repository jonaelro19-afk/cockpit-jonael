// Ajoute / complète les 20 prospects "corporate & institutions" de M&J.
// Met à jour les doublons existants (par nom), crée les nouveaux.
//   npx tsx scripts/seed-prospection-corporate.ts
//
// ⚠️ Les coordonnées viennent d'une liste générée : à VÉRIFIER avant usage.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

type Row = {
  name: string;
  aliasOf?: string; // nom exact d'un prospect déjà en base à compléter
  segment: string;
  sector?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  priority?: "haute" | "normale" | "basse";
  notes: string;
};

const ROWS: Row[] = [
  // ── Événementiel ──
  { name: "La Firme", aliasOf: "La Firme", segment: "Club d'affaires", sector: "Networking", email: "contact@lafirme.biz", phone: "+33 6 73 29 90 67", address: "Toulouse", priority: "haute", notes: "Club d'affaires, événements réguliers." },
  { name: "La Mêlée", aliasOf: "La Mêlée", segment: "Événementiel", sector: "Startup / Innovation", email: "contact@lamelee.com", phone: "+33 5 32 10 81 20", address: "27 Rue d'Aubuisson, 31000 Toulouse", priority: "haute", notes: "Écosystème startup, nombreux événements annuels — à réévaluer." },
  { name: "Réseau Entreprendre Occitanie-Garonne", aliasOf: "Réseau Entreprendre Occitanie-Garonne", segment: "Club d'affaires", sector: "Entrepreneuriat", address: "Toulouse", priority: "haute", notes: "Réseau d'entrepreneurs, événements mensuels." },
  { name: "CCI Toulouse Haute-Garonne", aliasOf: "CCI Toulouse Haute-Garonne", segment: "Institution", sector: "Commerce / Industrie", email: "webmestre@toulouse.cci.fr", address: "2 rue d'Alsace-Lorraine, 31002 Toulouse Cedex 6", priority: "haute", notes: "Gestion d'événements, formations. Contact communication à identifier." },
  { name: "CCI Occitanie", segment: "Institution", sector: "Commerce / Industrie", email: "contact@occitanie.cci.fr", phone: "+33 5 62 74 20 00", address: "5 rue Dieudonné Costes, 31700 Blagnac", priority: "haute", notes: "Région Occitanie, plusieurs sites." },
  { name: "French Tech Toulouse", aliasOf: "French Tech Toulouse", segment: "Club d'affaires", sector: "Tech / Innovation", address: "Toulouse", priority: "normale", notes: "Écosystème tech, association." },
  { name: "Occitanie Invest", segment: "Événementiel", sector: "Investissement", contactName: "Julie Myc-Rachedi (Communication & Événementiel)", email: "julie.myc-rachedi@agence-adocc.com", phone: "+33 4 99 64 29 35", address: "55 avenue Louis Breguet, 31400 Toulouse", priority: "haute", notes: "Summit annuel investisseurs, haute visibilité." },

  // ── Institutions & Formation ──
  { name: "INSA Toulouse", segment: "Institution", sector: "Enseignement", phone: "+33 5 61 55 61 55", address: "Avenue de Rangueil, 31077 Toulouse", priority: "normale", notes: "Grande école d'ingénieurs. Vidéos institutionnelles + events. Contact : direction communication à identifier." },
  { name: "Toulouse Business School (TBS)", segment: "Institution", sector: "Enseignement", email: "contact@tbs-education.com", phone: "+33 5 61 29 49 49", address: "20 Boulevard Lascrosses, 31068 Toulouse", priority: "normale", notes: "École de commerce. Galas étudiants, events alumni." },
  { name: "SKEMA Business School", segment: "Institution", sector: "Enseignement", address: "Toulouse", priority: "normale", notes: "Campus Toulouse + autres villes. Contact communication à identifier." },
  { name: "Université Paul Sabatier Toulouse 3", segment: "Institution", sector: "Enseignement", email: "contact@univ-tlse3.fr", phone: "+33 5 61 55 66 11", address: "118 Route de Narbonne, 31062 Toulouse", priority: "normale", notes: "Université publique. Vidéos institutionnelles, alumni." },
  { name: "Université Toulouse Jean Jaurès", segment: "Institution", sector: "Enseignement", email: "webmaster@univ-tlse2.fr", phone: "+33 5 61 50 42 50", address: "5 allée Antonio Machado, 31058 Toulouse Cedex 9", priority: "normale", notes: "Université généraliste. Vidéos campus + événements." },
  { name: "Toulouse Tech Transfer (SATT)", segment: "Institution", sector: "Innovation / transfert technologique", email: "contact@toulouse-tech-transfer.com", phone: "+33 5 62 25 50 60", address: "118 Route de Narbonne, 31432 Toulouse Cedex 4", priority: "normale", notes: "SATT. Pitch videos, events." },

  // ── Corporate B2B ──
  { name: "Liebherr-Aerospace Toulouse", segment: "Corporate", sector: "Aéronautique", phone: "+33 5 34 61 04 20", address: "31016 Toulouse", priority: "haute", notes: "Composants aéronautiques. Aftermovies événements, marque employeur. Contact communication à identifier." },
  { name: "Thales Alenia Space", segment: "Corporate", sector: "Aéronautique / Défense", contactName: "Lucille Ratel (Communication & Événementiel)", phone: "+33 5 67 37 00 00", address: "Toulouse", priority: "haute", notes: "Grands contrats. Vidéos institutionnelles, gala annuel. Email à trouver via LinkedIn." },
  { name: "Boehringer Ingelheim Toulouse", segment: "Corporate", sector: "Pharma / Biotech", phone: "+33 5 61 48 48 48", address: "Toulouse", priority: "normale", notes: "Laboratoire pharma. Événements internes, marque employeur." },
  { name: "bioMérieux", segment: "Corporate", sector: "Biotech / Diagnostic", email: "contact@biomerieux.com", phone: "+33 4 78 87 20 00", address: "69280 Marcy-l'Étoile (siège) — site Toulouse à confirmer", priority: "normale", notes: "Biotech diagnostic. Vidéos corporate, testimonials." },
  { name: "Capgemini Technology Services Toulouse", segment: "Corporate", sector: "Tech / Services", phone: "+33 5 61 58 58 58", address: "31100 Toulouse", priority: "normale", notes: "SSII. Conférences, marque employeur, aftermovies." },
  { name: "CGI Toulouse", segment: "Corporate", sector: "Tech / Services", phone: "+33 5 34 57 90 00", address: "31100 Toulouse", priority: "normale", notes: "Services IT. Corporate events, LinkedIn récurrent." },
  { name: "Nubbo — Incubateur Toulouse", segment: "Corporate", sector: "Incubation / Startup", website: "nubbo.co", address: "Toulouse", priority: "normale", notes: "Incubateur de startups. Pitch videos, events startups." },
];

function mergeNote(existing: string, add: string): string {
  if (!existing) return add;
  if (existing.includes(add.slice(0, 30))) return existing;
  return `${existing}\n${add}`;
}

(async () => {
  let created = 0;
  let updated = 0;
  for (const r of ROWS) {
    const existing = r.aliasOf
      ? await prisma.prospect.findFirst({ where: { name: r.aliasOf } })
      : await prisma.prospect.findFirst({ where: { name: r.name } });

    const base = {
      segment: r.segment,
      sector: r.sector ?? "",
      priority: r.priority ?? "normale",
    };

    if (existing) {
      await prisma.prospect.update({
        where: { id: existing.id },
        data: {
          ...base,
          contactName: existing.contactName || r.contactName || "",
          email: existing.email || r.email || "",
          phone: existing.phone || r.phone || "",
          address: existing.address || r.address || "",
          website: existing.website || r.website || "",
          notes: mergeNote(existing.notes, r.notes),
        },
      });
      updated++;
    } else {
      await prisma.prospect.create({
        data: {
          name: r.name,
          ...base,
          contactName: r.contactName ?? "",
          email: r.email ?? "",
          phone: r.phone ?? "",
          address: r.address ?? "",
          website: r.website ?? "",
          status: "À contacter",
          notes: r.notes,
        },
      });
      created++;
    }
  }
  const total = await prisma.prospect.count();
  console.log(`Créés : ${created} · Mis à jour : ${updated} · Total prospects : ${total}`);
  await prisma.$disconnect();
})();
