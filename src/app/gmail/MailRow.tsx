"use client";

import { useTransition } from "react";
import { Archive, ExternalLink } from "lucide-react";
import { archiveMail } from "./actions";
import type { MailSummary } from "@/lib/google/gmail";

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MailRow({
  mail,
  showReason = false,
  canArchive = true,
}: {
  mail: MailSummary;
  showReason?: boolean;
  canArchive?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <li
      className={`flex items-start gap-3 py-3 transition-opacity ${
        pending ? "opacity-30" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-text">
            {mail.from}
          </span>
          <span className="shrink-0 text-xs text-muted">
            {fmtWhen(mail.date)}
          </span>
        </div>
        <p className="truncate text-sm text-text">{mail.subject}</p>
        <p className="truncate text-xs text-muted">{mail.snippet}</p>
        {showReason && (
          <p className="mt-0.5 text-[11px] text-faint">{mail.reason}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a
          href={`https://mail.google.com/mail/u/0/#inbox/${mail.threadId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          aria-label="Ouvrir dans Gmail"
        >
          <ExternalLink size={14} />
        </a>
        {canArchive && (
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => archiveMail(mail.id))}
            className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text disabled:opacity-50"
            aria-label="Archiver"
            title="Archiver"
          >
            <Archive size={14} />
          </button>
        )}
      </div>
    </li>
  );
}
