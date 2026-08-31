// Fournit un access_token Google valide pour appeler l'API Calendar.
//
// Un access_token Google expire au bout d'~1 h. On garde en base (table
// Account) le refresh_token, qui permet d'en obtenir un nouveau sans
// redemander à l'utilisateur de se connecter. Cette fonction :
//   1. lit le compte Google en base,
//   2. renvoie l'access_token s'il est encore valide,
//   3. sinon le rafraîchit auprès de Google et met la base à jour.

import { prisma } from "@/lib/prisma";

export type AccessTokenResult =
  | { accessToken: string; error: null }
  | { accessToken: null; error: "NotConnected" | "RefreshTokenError" };

export async function getGoogleAccessToken(
  userId: string,
): Promise<AccessTokenResult> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) {
    return { accessToken: null, error: "NotConnected" };
  }

  // Encore valide (avec 1 min de marge) ? On le renvoie tel quel.
  const expiresInMs = (account.expires_at ?? 0) * 1000 - Date.now();
  if (expiresInMs > 60_000) {
    return { accessToken: account.access_token, error: null };
  }

  if (!account.refresh_token) {
    return { accessToken: null, error: "RefreshTokenError" };
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID?.trim() ?? "",
        client_secret: process.env.AUTH_GOOGLE_SECRET?.trim() ?? "",
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
      }),
    });

    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
    };
    if (!res.ok || !data.access_token) {
      throw new Error(`Google token endpoint: ${res.status}`);
    }

    await prisma.account.update({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: account.providerAccountId,
        },
      },
      data: {
        access_token: data.access_token,
        expires_at: Math.floor(Date.now() / 1000 + (data.expires_in ?? 3600)),
        refresh_token: data.refresh_token ?? account.refresh_token,
      },
    });

    return { accessToken: data.access_token, error: null };
  } catch (err) {
    console.error("Échec du rafraîchissement du jeton Google", err);
    return { accessToken: null, error: "RefreshTokenError" };
  }
}
