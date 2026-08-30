// Sauvegarde toutes les données de la base SQLite locale dans un JSON.
// À lancer AVANT de regénérer le client Prisma pour Postgres.
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" }),
});

const TABLES = [
  "user",
  "account",
  "session",
  "verificationToken",
  "subject",
  "chapter",
  "notion",
  "notionVersion",
  "link",
  "calendarSource",
  "appSetting",
  "sportActivity",
  "weeklyReport",
  "client",
  "project",
  "quote",
  "quoteLine",
  "tarifItem",
  "equipment",
  "task",
] as const;

async function main() {
  const dump: Record<string, unknown[]> = {};
  for (const t of TABLES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (db as any)[t].findMany();
    dump[t] = rows;
    console.log(`${t}: ${rows.length}`);
  }
  writeFileSync("scripts/data-dump.json", JSON.stringify(dump, null, 2));
  console.log("\n→ scripts/data-dump.json écrit.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
