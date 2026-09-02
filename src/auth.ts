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
import { isEmailAllowed, roleFor } from "@/lib/access";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    Google({
      // .trim() : une variable d'environnement collée avec un espace en trop
      // (fréquent sur Vercel) donnerait sinon « invalid_client » chez Google.
      clientId: process.env.AUTH_GOOGLE_ID?.trim(),
      clientSecret: process.env.AUTH_GOOGLE_SECRET?.trim(),
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
            // Rédaction : brouillons + envoi de réponses depuis le cockpit.
            "https://www.googleapis.com/auth/gmail.compose",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Sécurité : seules les adresses de ALLOWED_EMAIL peuvent se connecter.
      if (!isEmailAllowed(profile?.email ?? user?.email)) return false;

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
    // Expose l'id utilisateur + le rôle côté application.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = roleFor(session.user.email);
      }
      return session;
    },
  },
});
