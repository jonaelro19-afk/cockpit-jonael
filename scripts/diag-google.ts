import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const a = await prisma.account.findFirst({ where: { provider: "google" } });
  if (!a) {
    console.log("Aucun compte Google en base.");
    return;
  }
  console.log("scope stocké :", a.scope);
  const hasGmail = a.scope?.includes("gmail.readonly");
  console.log("→ scope Gmail présent :", hasGmail ? "OUI ✅" : "NON ❌ (reconnexion requise)");

  if (a.access_token) {
    const r = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/profile",
      { headers: { Authorization: `Bearer ${a.access_token}` } },
    );
    console.log("\nGmail API test :", r.status, (await r.text()).slice(0, 300));
  }
}

main().finally(() => prisma.$disconnect());
