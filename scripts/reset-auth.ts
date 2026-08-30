// Efface les données de connexion (User / Account / Session).
// À utiliser si les jetons stockés sont périmés : on repart d'une
// connexion propre. Ne touche pas aux CalendarSource.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("Données de connexion effacées. Reconnecte-toi sur /timebox.");
}

main().finally(() => prisma.$disconnect());
