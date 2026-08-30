/*
  Remplissage initial de la table CalendarSource.

  On y liste les calendriers Google de Jonael avec un pré-réglage
  raisonnable (catégorie, inclusion dans la Timebox). Tu pourras tout
  ajuster ensuite depuis la page /parametres.

  Lancer avec :  npm run db:seed
  Ré-exécutable sans risque : les calendriers déjà présents ne sont pas
  écrasés (on ne fait que créer les manquants).
*/
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

type Seed = {
  googleCalendarId: string;
  label: string;
  category: "BTS" | "Sport" | "M&J" | "Perso" | "Pause" | "Cours";
  includeInTimebox: boolean;
  moduleTag?: "sport" | "bts" | "mj";
  sortOrder: number;
};

const calendars: Seed[] = [
  { googleCalendarId: "jonael.ro19@gmail.com", label: "ROUTINE", category: "Perso", includeInTimebox: true, sortOrder: 0 },
  { googleCalendarId: "h8259b5l7q1e0slipbk26kh3l857s3ls@import.calendar.google.com", label: "Emploi du temps ICAM", category: "Cours", includeInTimebox: true, sortOrder: 1 },
  { googleCalendarId: "0d05c46f7ce9f6b5bb6f76d6a37f4b36e17d1d40fef61077f28921b6abdae5f4@group.calendar.google.com", label: "BTS", category: "BTS", includeInTimebox: true, moduleTag: "bts", sortOrder: 2 },
  { googleCalendarId: "a36024b194b1262cd32ec70549f78b8400b1f6c12b7be60b130e358b5c502d7e@group.calendar.google.com", label: "ANGLAIS", category: "Cours", includeInTimebox: true, sortOrder: 3 },
  { googleCalendarId: "89c1fdb84c75eef66ff2d53ca7af61aa03251a983c2efb56d5ab074b3d8249a5@group.calendar.google.com", label: "SPORT", category: "Sport", includeInTimebox: true, moduleTag: "sport", sortOrder: 4 },
  { googleCalendarId: "6303f158ecbf5f2e875f52d9804565107b3fff28baf0a8c2fde915846c2e0f7b@group.calendar.google.com", label: "M&J PRODUCTION", category: "M&J", includeInTimebox: true, moduleTag: "mj", sortOrder: 5 },
  { googleCalendarId: "bab0472efccd1c99f4b5deaffeacc185e3b2e6c73c9ab53f3e4c7de13c52b176@group.calendar.google.com", label: "STAGE", category: "Perso", includeInTimebox: true, sortOrder: 6 },
  { googleCalendarId: "decbba6c9ca64f03652c93d08f1ee3a508d953573c1d48146bbc524f1d86e2fe@group.calendar.google.com", label: "PERSO", category: "Perso", includeInTimebox: true, sortOrder: 7 },
  { googleCalendarId: "cc4bcc06f3f6f859ef284423341bda787d2b7150448267eabcb7ba1ba3f90bdf@group.calendar.google.com", label: "FAMILLE", category: "Perso", includeInTimebox: true, sortOrder: 8 },
  { googleCalendarId: "329ea10239dc7f3d15c904e76d48e734fdd72ad3e1c1fe259a30430b5367bd46@group.calendar.google.com", label: "LOGISTIQUE", category: "Perso", includeInTimebox: true, sortOrder: 9 },
  { googleCalendarId: "c1aaa928fa84fc5e19a5ed991943b1bdb6abb5e6e894974ae426d02b46cc0d69@group.calendar.google.com", label: "TODO-LIST", category: "Perso", includeInTimebox: false, sortOrder: 10 },
  { googleCalendarId: "fr.french#holiday@group.v.calendar.google.com", label: "Jours fériés (France)", category: "Perso", includeInTimebox: false, sortOrder: 11 },
  { googleCalendarId: "e_2_fr#weeknum@group.v.calendar.google.com", label: "Numéros de semaine", category: "Perso", includeInTimebox: false, sortOrder: 12 },
];

async function main() {
  for (const c of calendars) {
    await prisma.calendarSource.upsert({
      where: { googleCalendarId: c.googleCalendarId },
      update: {}, // calendrier déjà connu : on n'écrase pas tes réglages
      create: {
        googleCalendarId: c.googleCalendarId,
        label: c.label,
        category: c.category,
        includeInTimebox: c.includeInTimebox,
        moduleTag: c.moduleTag ?? null,
        sortOrder: c.sortOrder,
      },
    });
  }
  const total = await prisma.calendarSource.count();
  console.log(`Seed terminé — ${total} calendriers en base.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
