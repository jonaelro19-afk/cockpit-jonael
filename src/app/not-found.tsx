import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 text-muted">
        <Compass size={30} strokeWidth={1.5} />
      </span>
      <p className="text-2xl font-extrabold tracking-tight">Page introuvable</p>
      <p className="mt-1 text-sm text-muted">
        Cette page n&apos;existe pas (ou plus).
      </p>
      <Link href="/" className="btn-primary mt-6">
        Retour au cockpit
      </Link>
    </div>
  );
}
