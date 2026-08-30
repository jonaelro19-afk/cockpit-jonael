// Boutons de connexion / déconnexion Google.
//
// Ce sont des "server actions" : le <form> appelle directement une fonction
// serveur, sans JavaScript côté client. signIn/signOut viennent de src/auth.ts.

import { signIn, signOut } from "@/auth";

export function SignInWithGoogle({ callbackUrl = "/timebox" }: { callbackUrl?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: callbackUrl });
      }}
    >
      <button type="submit" className="btn-primary">
        Connecter Google Agenda
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="text-xs font-medium text-muted hover:text-text hover:underline"
      >
        Se déconnecter
      </button>
    </form>
  );
}
