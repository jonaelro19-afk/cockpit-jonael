import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isOwnerEmail } from "@/lib/access";

// À appeler dans le layout des onglets "perso" (Gmail, Timebox, Sport,
// Tâches, BTS, Paramètres) : un collaborateur M&J y est renvoyé vers /mj.
export async function requireOwner() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");
  if (!isOwnerEmail(session.user.email)) redirect("/mj");
  return session.user;
}
