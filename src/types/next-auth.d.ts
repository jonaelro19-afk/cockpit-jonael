// Ajoute `id` et `role` sur session.user pour TypeScript.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "collab";
    } & DefaultSession["user"];
  }
}
