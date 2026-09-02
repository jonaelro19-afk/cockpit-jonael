import type { ReactNode } from "react";
import { requireOwner } from "@/lib/require-owner";

// Onglet réservé à Jonael. Un collaborateur M&J est renvoyé vers /mj.
export default async function Layout({ children }: { children: ReactNode }) {
  await requireOwner();
  return children;
}
