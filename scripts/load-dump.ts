// Charge scripts/data-dump.json dans la base Postgres (Neon).
// À lancer APRÈS `prisma migrate deploy` sur la base Postgres vide.
//
//   npm run migrate:pg
import "dotenv/config";
import { readFileSync } from "node:fs";
import { prisma } from "../src/lib/prisma";

// Ordre respectant les clés étrangères.
const ORDER = [
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
  const dump = JSON.parse(
    readFileSync("scripts/data-dump.json", "utf8"),
  ) as Record<string, Record<string, unknown>[]>;

  for (const table of ORDER) {
    const rows = dump[table] ?? [];
    if (rows.length === 0) {
      console.log(`${table}: (vide)`);
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[table];
    const res = await model.createMany({ data: rows, skipDuplicates: true });
    console.log(`${table}: ${res.count} lignes insérées`);
  }
  console.log("\n→ Import terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
