"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, FileText, FolderPlus } from "lucide-react";

export default function AddMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-primary"
      >
        <Plus size={15} /> Ajouter
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-card border border-line bg-surface shadow-xl">
          <Link
            href="/bts/fiches/nouvelle"
            className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2"
            onClick={() => setOpen(false)}
          >
            <FileText size={16} className="mt-0.5 text-[#a78bfa]" />
            <span>
              <span className="block text-sm font-medium">Fiche de révision</span>
              <span className="block text-xs text-muted">
                Colle un cours, l&apos;IA le met en fiche
              </span>
            </span>
          </Link>
          <Link
            href="/bts/matieres/nouvelle"
            className="flex items-start gap-3 border-t border-line px-4 py-3 hover:bg-surface-2"
            onClick={() => setOpen(false)}
          >
            <FolderPlus size={16} className="mt-0.5 text-[#a78bfa]" />
            <span>
              <span className="block text-sm font-medium">Nouvelle matière</span>
              <span className="block text-xs text-muted">
                Ajouter une matière au carnet
              </span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
