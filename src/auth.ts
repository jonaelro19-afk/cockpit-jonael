// Configuration centrale de l'authentification (Auth.js v5 / NextAuth).
//
// - Fournisseur : Google (OAuth).
// - Les comptes, sessions et jetons sont stockés en base via l'adapter Prisma.
// - On demande "access_type=offline" + "prompt=consent" pour obtenir un
//   refresh_token (indispensable pour garder l'accès à l'agenda dans la durée).
// - Scopes : calendar (lecture+écriture) et gmail.modify (lire + archiver).
//   Ajouter/élargir un scope = il faut se reconnecter une fois pour l'activer.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    Google({
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/gmail.modify",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Sécurité : une seule adresse Google peut se connecter à l'app.
      const allowed = process.env.ALLOWED_EMAIL?.toLowerCase().trim();
      if (allowed && profile?.email?.toLowerCase() !== allowed) return false;

      // Par défaut, l'adapter Prisma n'enregistre les jetons Google qu'à la
      // toute première connexion. Si l'utilisateur se reconnecte (ex. pour
      // accorder une nouvelle permission), on met à jour les jetons stockés.
      if (account && user?.id) {
        await prisma.account.updateMany({
          where: { userId: user.id, provider: account.provider },
          data: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
            id_token: account.id_token,
            token_type: account.token_type,
          },
        });
      }
      return true;
    },
    // Expose l'id utilisateur côté application.
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
