// Barre supérieure — téléphone uniquement. Marque + accès rapide profil.
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { auth } from "@/auth";
import BrandMark from "./BrandMark";

export default async function MobileHeader({
  owner = true,
}: {
  owner?: boolean;
}) {
  const session = await auth();
  const home = owner ? "/" : "/mj";

  const avatar = session?.user?.image ? (
    <img
      src={session.user.image}
      alt=""
      className="h-8 w-8 rounded-full object-cover"
    />
  ) : (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-muted">
      {(session?.user?.name ?? "?").charAt(0).toUpperCase()}
    </span>
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur md:hidden print:hidden">
      <Link
        href={home}
        className="flex items-center gap-2 font-extrabold tracking-tight"
      >
        <BrandMark className="h-6 w-6" />
        Cockpit
      </Link>
      <Link
        href={owner ? "/parametres" : "/api/auth/signout"}
        aria-label={owner ? "Paramètres" : "Se déconnecter"}
      >
        {avatar}
      </Link>
    </header>
  );
}
