"use client";

import { useTransition } from "react";
import { clearDoneTasks } from "./actions";

export default function ClearDone() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => clearDoneTasks())}
      className="text-xs font-medium text-muted hover:text-text hover:underline"
    >
      {pending ? "…" : "Effacer les terminées"}
    </button>
  );
}
