"use client";

import { useState, useTransition } from "react";
import { Archive } from "lucide-react";
import { archiveBucket } from "./actions";
import type { Bucket } from "@/lib/google/gmail";

export default function ArchiveBucketButton({
  bucket,
  count,
}: {
  bucket: Bucket;
  count: number;
}) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (count === 0) return null;

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="btn-secondary"
      >
        <Archive size={14} /> Archiver ({count})
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => archiveBucket(bucket))}
        className="btn-primary"
      >
        {pending ? "Archivage…" : `Confirmer — archiver ${count}`}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="btn-ghost"
      >
        Annuler
      </button>
    </span>
  );
}
