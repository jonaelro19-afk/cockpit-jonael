"use client";
// Import de fichiers .FIT : bouton pilule + liste des fichiers choisis.

import { useRef, useState, useTransition } from "react";
import { importFitFiles } from "./actions";

export default function FitImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(() => importFitFiles(fd))}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        ref={inputRef}
        type="file"
        name="files"
        accept=".fit"
        multiple
        className="sr-only"
        onChange={(e) =>
          setNames(Array.from(e.target.files ?? []).map((f) => f.name))
        }
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-secondary"
      >
        Choisir des .FIT
      </button>
      {names.length > 0 && (
        <>
          <span className="text-xs text-muted">
            {names.length} fichier{names.length > 1 ? "s" : ""}
          </span>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Import…" : "Importer"}
          </button>
        </>
      )}
    </form>
  );
}
