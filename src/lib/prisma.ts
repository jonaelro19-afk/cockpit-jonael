// Point d'accès unique à la base de données.
//
// Prisma 7 se connecte via un "driver adapter". On choisit automatiquement :
//   - Postgres / Neon  si DATABASE_URL commence par "postgres" (déploiement)
//   - SQLite locale     sinon (développement, fichier prisma/dev.db)
//
// ⚠️ Le générateur Prisma cible UN seul provider (voir prisma/schema.prisma).
// Pour le déploiement : basculer le provider en "postgresql" + `prisma generate`
// (procédure complète dans DEPLOY.md). L'adaptateur ci-dessous suit tout seul.

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  if (url.startsWith("postgres")) {
    // Déploiement : Neon serverless
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require("@prisma/adapter-neon");
    return new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
  }

  // Local : SQLite
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
