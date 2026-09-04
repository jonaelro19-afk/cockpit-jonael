"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { PROSPECT_STATUSES, statusMeta } from "@/lib/prospection-shared";
import { setProspectStatus } from "./actions";

export default function QuickStatus({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const meta = statusMeta[status];

  return (
    <select
      value={status}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const v = e.target.value;
        start(async () => {
          await setProspectStatus(id, v);
          router.refresh();
        });
      }}
      className="rounded-pill border border-line bg-surface-2 px-2 py-1 text-xs font-medium disabled:opacity-50"
      style={{ color: meta?.color }}
    >
      {PROSPECT_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-surface text-text">
          {s}
        </option>
      ))}
    </select>
  );
}
