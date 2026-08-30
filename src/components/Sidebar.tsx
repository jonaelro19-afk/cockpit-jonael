"use client";
// Barre de navigation latérale (desktop uniquement — voir MobileNav pour le tél).

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { modules, settingsModule } from "@/lib/modules";
import BrandMark from "./BrandMark";

export default function Sidebar({ footer }: { footer?: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const item = (m: (typeof modules)[number]) => {
    const active = isActive(m.href);
    return (
      <div key={m.key} className="shrink-0">
        <Link
          href={m.href}
          className={`group flex items-center gap-3 rounded-pill px-3.5 py-2 text-sm font-medium transition-colors ${
            active
              ? "bg-white/[0.08] text-text"
              : "text-muted hover:bg-white/[0.04] hover:text-text"
          }`}
        >
          <m.Icon
            size={18}
            strokeWidth={1.75}
            style={active ? { color: m.color } : undefined}
            className="shrink-0 transition-colors group-hover:text-text"
          />
          <span>{m.label}</span>
        </Link>

        {m.children && active && (
          <div className="ml-[1.6rem] hidden border-l border-line pl-3 md:block">
            {m.children.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`block rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                  pathname === c.href
                    ? "text-text"
                    : "text-muted hover:text-text"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="hidden shrink-0 flex-col gap-1 border-r border-line bg-bg p-3 md:flex md:h-screen md:w-64 md:overflow-y-auto">
      <Link
        href="/"
        className="mb-2 flex items-center gap-2.5 px-2.5 py-3 text-lg font-extrabold tracking-tight"
      >
        <BrandMark className="h-7 w-7" />
        Cockpit
        <span className="text-muted">/ Jonael</span>
      </Link>

      {modules.map(item)}

      <div className="mt-1">{item(settingsModule)}</div>

      {footer && (
        <div className="border-t border-line md:mt-auto">{footer}</div>
      )}
    </nav>
  );
}
