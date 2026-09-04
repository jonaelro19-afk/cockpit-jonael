"use client";
// Barre d'onglets basse — visible sur téléphone uniquement.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { moduleByKey, settingsModule } from "@/lib/modules";

// Barre du bas : 5 accès + Paramètres. BTS / Gmail via les cartes du Dashboard.
const ownerTabs = ["dashboard", "timebox", "taches", "sport", "mj"].map(
  (k) => moduleByKey[k],
);

export default function MobileNav({ owner = true }: { owner?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Collaborateur : uniquement les sous-onglets M&J (libellés courts).
  const shortLabel: Record<string, string> = {
    "/mj": "M&J",
    "/mj/prospection": "Prospect.",
    "/mj/clients": "Clients",
    "/mj/devis": "Devis",
    "/mj/agents": "Agents",
    "/mj/suivi": "Matériel",
    "/mj/memo": "Mémo",
  };
  const items = owner
    ? [...ownerTabs, settingsModule]
    : (moduleByKey.mj.children ?? []).map((c) => ({
        key: c.href,
        href: c.href,
        label: shortLabel[c.href] ?? c.label,
        Icon: moduleByKey.mj.Icon,
        color: moduleByKey.mj.color,
      }));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden">
      {items.map((m) => {
        const active = isActive(m.href);
        return (
          <Link
            key={m.key}
            href={m.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium"
          >
            <m.Icon
              size={22}
              strokeWidth={active ? 2.1 : 1.75}
              style={active ? { color: m.color } : undefined}
              className={active ? "" : "text-muted"}
            />
            <span className={active ? "text-text" : "text-muted"}>
              {m.label === "M&J Prod" ? "M&J" : m.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
