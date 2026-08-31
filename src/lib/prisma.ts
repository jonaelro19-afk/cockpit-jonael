// Point d'accès unique à la base de données (Postgres / Neon, en local comme en prod).
//
// Prisma 7 se connecte via un "driver adapter". On utilise l'adaptateur Neon
// serverless, qui parle à la base par-dessus WebSocket (indispensable dans un
// environnement serverless comme Vercel).

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // .trim() + retrait des guillemets : robustesse face à une variable
  // d'environnement Vercel collée avec un espace ou des quotes en trop.
  const connectionString = process.env.DATABASE_URL?.trim().replace(
    /^['"]|['"]$/g,
    "",
  );
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL est absente. En local : la remplir dans .env. Sur Vercel : Settings → Environment Variables.",
    );
  }
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
