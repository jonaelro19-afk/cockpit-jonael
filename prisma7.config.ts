// Configuration Prisma (CLI) — utilisée par `prisma migrate` / `prisma studio`.
// Le runtime de l'app, lui, passe par l'adaptateur Neon (src/lib/prisma.ts).
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Nettoie une URL venue d'une variable d'environnement : Vercel (ou un
// copier-coller) peut y laisser des espaces ou des guillemets qui font
// échouer Prisma avec « P1013 : schéma non reconnu dans l'URL ».
function cleanUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  return trimmed || undefined;
}

const migrationUrl =
  cleanUrl(process.env["DATABASE_URL_UNPOOLED"]) ??
  cleanUrl(process.env["DATABASE_URL"]);

if (!migrationUrl) {
  throw new Error(
    "Aucune URL de base de données. Renseigne DATABASE_URL (et DATABASE_URL_UNPOOLED) dans .env / les variables Vercel.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
