"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { moduleByKey } from "@/lib/modules";

export default function MjTabs() {
  const pathname = usePathname();
  const tabs = moduleByKey.mj.children ?? [];

  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-white text-text"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
