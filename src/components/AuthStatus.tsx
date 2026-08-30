// Affiche l'état de connexion Google (bas de la barre latérale).
/* eslint-disable @next/next/no-img-element */
import { auth } from "@/auth";
import { SignInWithGoogle, SignOutButton } from "./SignInWithGoogle";

export default async function AuthStatus() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="px-3 py-3">
        <SignInWithGoogle callbackUrl="/timebox" />
      </div>
    );
  }

  const initial = (session.user.name ?? session.user.email ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2.5 px-3 py-3">
      <div className="relative shrink-0">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-muted">
            {initial}
          </div>
        )}
        {/* pastille "en ligne" */}
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg bg-online" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted" title={session.user.email ?? ""}>
          {session.user.email}
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
