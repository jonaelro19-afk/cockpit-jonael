// Insère les prospects M&J connus (une fois, si la table est vide).
//   npx tsx scripts/seed-prospection.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

type Seed = {
  name: string;
  segment: string;
  status: string;
  email?: string;
  phone?: string;
  lastContact?: string;
  notes?: string;
};

const SEED: Seed[] = [
  // ── Fleuristes (Toulouse) ──
  { name: "Mahonia Fleuriste", segment: "Fleuriste", status: "En cours", email: "mahoniafleuristetoulouse@gmail.com", lastContact: "2026-08-15", notes: "Intéressé — a demandé les infos par mail." },
  { name: "Les Jardins d'Alice", segment: "Fleuriste", status: "En cours", email: "jardins.alice.toulouse@gmail.com", lastContact: "2026-08-15", notes: "Intéressé — mail pour contacter la patronne." },
  { name: "La Vie en Rose", segment: "Fleuriste", status: "En cours", lastContact: "2026-08-10", notes: "À rappeler en octobre. Favorable à un shooting simple mettant en avant les plus beaux bouquets." },
  { name: "Fleur de Vie", segment: "Fleuriste", status: "À contacter", notes: "Fleuriste Toulouse. Script d'appel prêt (voir Mémo)." },
  { name: "Le Fleuriste", segment: "Fleuriste", status: "Refusé" },
  { name: "Parc des Fleurs", segment: "Fleuriste", status: "Refusé" },

  // ── Restaurants ──
  { name: "Riviera Tolosa", segment: "Restaurant", status: "À contacter", notes: "Instagram vide — bon potentiel." },
  { name: "Chez Loustic", segment: "Restaurant", status: "À contacter", notes: "Pas de photo pro, irrégulier sur Instagram." },
  { name: "Restaurant Pépère", segment: "Restaurant", status: "À contacter", notes: "Pas de belles photos." },
  { name: "Le Saint Sauvage", segment: "Restaurant", status: "À contacter", notes: "À qualifier." },
  { name: "Mantesino", segment: "Restaurant", status: "À contacter", notes: "À qualifier." },
  { name: "HOPE! Restaurant", segment: "Restaurant", status: "Refusé" },
  { name: "L'Octave", segment: "Restaurant", status: "Refusé", notes: "Assez de clients, veut rester discret." },
  { name: "Reflets", segment: "Restaurant", status: "Refusé", notes: "Pas d'intérêt à développer l'Instagram." },

  // ── Clubs d'affaires ──
  { name: "La Firme", segment: "Club d'affaires", status: "À contacter", notes: "Personne ne répond. Bon terrain d'entraînement pour roder le script au téléphone. Appel prévu 19/07 (à refaire)." },
  { name: "La Mêlée", segment: "Club d'affaires", status: "Refusé", notes: "Déjà quelqu'un. Cluster numérique régional." },
  { name: "Réseau Entreprendre Occitanie-Garonne", segment: "Club d'affaires", status: "En cours", email: "adumas@reseau-entreprendre.org", lastContact: "2026-07-23", notes: "Bonne cible (25 ans, communique sur ses événements). Contacts : lgeha@reseau-entreprendre.org (pas de réponse), adumas@ (à relancer). Appel prévu 23/07 avec Collonges." },
  { name: "French Tech Toulouse", segment: "Club d'affaires", status: "À contacter", phone: "05 36 25 21 94", notes: "Vise 400 membres → plus ouverte au dialogue. Moyen-difficile. Appel prévu 28/07 (à refaire)." },
  { name: "CCI Toulouse Haute-Garonne", segment: "Club d'affaires", status: "À contacter", phone: "05 61 33 65 00", notes: "Événements club des jeunes entreprises sur invitation only. Difficile. Appel prévu 28/07." },
  { name: "Medef Haute-Garonne", segment: "Club d'affaires", status: "À contacter", phone: "05 61 14 42 00", notes: "Syndicat patronal, poids politique. Difficile — besoin d'une vraie légitimité." },
  { name: "Aerospace Valley", segment: "Club d'affaires", status: "En pause", notes: "Cluster aéro/spatial (Airbus…). Très difficile, quasi impossible sans recommandation interne. À viser plus tard." },
];

(async () => {
  const count = await prisma.prospect.count();
  if (count > 0) {
    console.log(`${count} prospect(s) déjà présents — on ne réinsère pas.`);
    await prisma.$disconnect();
    return;
  }
  for (const s of SEED) {
    await prisma.prospect.create({
      data: {
        name: s.name,
        segment: s.segment,
        status: s.status,
        email: s.email ?? "",
        phone: s.phone ?? "",
        notes: s.notes ?? "",
        lastContact: s.lastContact ? new Date(s.lastContact) : null,
        firstContact: s.lastContact ? new Date(s.lastContact) : null,
      },
    });
  }
  console.log(`${SEED.length} prospects insérés.`);
  await prisma.$disconnect();
})();
