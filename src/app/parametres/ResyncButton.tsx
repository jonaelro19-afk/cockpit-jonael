"use client";

import { useState, useTransition } from "react";
import { resyncCalendars } from "./actions";

export default function ResyncButton() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await resyncCalendars();
            setDone(true);
          })
        }
        className="btn-secondary"
      >
        {pending ? "Synchronisation…" : "Resynchroniser depuis Google"}
      </button>
      {done && !pending && (
        <span className="text-xs text-online">À jour ✓</span>
      )}
    </div>
  );
}
