/*
  Importe le carnet de notions HTML dans la base.

  Le fichier HTML contient deux littéraux JavaScript :
    const DATA  = { <MATIÈRE>: { name, color, chapters: { <chapitre>: [ {id, term, oneliner, html}, ... ] } } }
    const LINKS = [ { name, url, desc, tag }, ... ]

  On les extrait, on les évalue, puis on remplit Subject / Chapter / Notion / Link.
  Idempotent : réexécutable sans doublon (upsert sur les clés naturelles).

  Usage :  npm run import:carnet -- [chemin/vers/carnet.html]
  Défaut : ~/Downloads/carnet_notions.html
*/
import "dotenv/config";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";

type RawNotion = { id: string; term: string; oneliner?: string; html?: string };
type RawSubject = {
  name: string;
  color: string;
  chapters: Record<string, RawNotion[]>;
};
type RawLink = { name: string; url: string; desc?: string; tag?: string };

const path =
  process.argv[2] || join(homedir(), "Downloads", "carnet_notions.html");

function extractLiteral(source: string, name: string): string {
  // Cherche "const NAME =" puis équilibre les accolades/crochets.
  const start = source.indexOf(`const ${name}`);
  if (start === -1) throw new Error(`"${name}" introuvable dans le fichier`);
  const eq = source.indexOf("=", start) + 1;
  let i = eq;
  while (" \n\t\r".includes(source[i])) i++;
  const open = source[i];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inTemplate = false;
  for (let j = i; j < source.length; j++) {
    const c = source[j];
    if (inTemplate) {
      if (c === "`" && source[j - 1] !== "\\") inTemplate = false;
      continue;
    }
    if (c === "`") inTemplate = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return source.slice(i, j + 1);
    }
  }
  throw new Error(`Littéral "${name}" mal fermé`);
}

async function main() {
  console.log(`Lecture de ${path}`);
  const html = readFileSync(path, "utf8");

  const DATA = new Function(
    `return (${extractLiteral(html, "DATA")})`,
  )() as Record<string, RawSubject>;
  const LINKS = new Function(
    `return (${extractLiteral(html, "LINKS")})`,
  )() as RawLink[];

  let nSub = 0;
  let nChap = 0;
  let nNot = 0;

  let subjOrder = 0;
  for (const [key, subj] of Object.entries(DATA)) {
    await prisma.subject.upsert({
      where: { id: key },
      update: { name: subj.name, color: subj.color, order: subjOrder },
      create: { id: key, name: subj.name, color: subj.color, order: subjOrder },
    });
    nSub++;
    subjOrder++;

    let chapOrder = 0;
    for (const [chapName, notions] of Object.entries(subj.chapters)) {
      const chapter = await prisma.chapter.upsert({
        where: { subjectId_name: { subjectId: key, name: chapName } },
        update: { order: chapOrder },
        create: { subjectId: key, name: chapName, order: chapOrder },
      });
      nChap++;
      chapOrder++;

      let notOrder = 0;
      for (const n of notions) {
        const content = (n.html ?? "").trim();
        await prisma.notion.upsert({
          where: { chapterId_slug: { chapterId: chapter.id, slug: n.id } },
          update: {
            term: n.term,
            oneliner: n.oneliner ?? "",
            contentHtml: content,
            order: notOrder,
          },
          create: {
            chapterId: chapter.id,
            slug: n.id,
            term: n.term,
            oneliner: n.oneliner ?? "",
            contentHtml: content,
            order: notOrder,
          },
        });
        nNot++;
        notOrder++;
      }
    }
  }

  let linkOrder = 0;
  for (const l of LINKS) {
    const subjectId = l.tag && DATA[l.tag] ? l.tag : null;
    const existing = await prisma.link.findFirst({ where: { name: l.name } });
    if (existing) {
      await prisma.link.update({
        where: { id: existing.id },
        data: { url: l.url, description: l.desc ?? "", subjectId, order: linkOrder },
      });
    } else {
      await prisma.link.create({
        data: {
          name: l.name,
          url: l.url,
          description: l.desc ?? "",
          subjectId,
          order: linkOrder,
        },
      });
    }
    linkOrder++;
  }

  console.log(
    `Import terminé : ${nSub} matières, ${nChap} chapitres, ${nNot} notions, ${LINKS.length} liens.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
