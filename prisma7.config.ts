// Configuration Prisma (CLI). Charge les variables de .env.
// Les migrations utilisent la connexion directe :
//   - local  : DATABASE_URL (fichier sqlite)
//   - déploiement : DATABASE_URL_UNPOOLED (Neon sans -pooler)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
