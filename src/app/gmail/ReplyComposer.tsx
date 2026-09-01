"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Send, FileText, Check } from "lucide-react";
import type { MailSummary } from "@/lib/google/gmail";
import { suggestReplyAction, sendReplyAction } from "./actions";

// Monté uniquement quand le composeur est ouvert (voir MailRow) : l'état
// repart donc de zéro à chaque ouverture.
export default function ReplyComposer({
  mail,
  canSend,
  onClose,
  onDone,
}: {
  mail: MailSummary;
  canSend: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [body, setBody] = useState("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState<null | "suggest" | "draft" | "send">(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "draft" | "send">(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const suggest = async () => {
    setBusy("suggest");
    setError(null);
    const res = await suggestReplyAction(mail.threadId, instruction);
    setBusy(null);
    if (res.ok) {
      setBody(res.text);
      setTimeout(() => areaRef.current?.focus(), 50);
    } else {
      setError(res.error);
    }
  };

  const submit = async (mode: "draft" | "send") => {
    if (!body.trim()) {
      setError("Écris ou génère une réponse d'abord.");
      return;
    }
    setBusy(mode);
    setError(null);
    const res = await sendReplyAction({ threadId: mail.threadId, body, mode });
    setBusy(null);
    if (res.ok) {
      setDone(mode);
      setTimeout(() => {
        onDone();
        onClose();
      }, 1400);
    } else {
      setError(res.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-card border border-line bg-surface sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">
              Répondre à {mail.from}
            </h2>
            <p className="truncate text-xs text-muted">{mail.subject}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost -mr-2 shrink-0 p-2"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <p className="rounded-field bg-surface-2 px-3 py-2 text-xs text-muted">
            {mail.snippet}
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Consigne pour l&apos;IA <span className="text-faint">(facultatif)</span>
            </label>
            <input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="ex : accepte, propose mardi 14 h, demande le budget…"
              className="field w-full text-sm"
            />
          </div>

          <button
            type="button"
            onClick={suggest}
            disabled={busy !== null}
            className="btn-secondary w-full disabled:opacity-50"
          >
            <Sparkles size={15} />
            {busy === "suggest"
              ? "Rédaction…"
              : body
                ? "Regénérer une proposition"
                : "Proposer une réponse"}
          </button>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Ta réponse <span className="text-faint">(à retravailler)</span>
            </label>
            <textarea
              ref={areaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Génère une proposition puis modifie-la ici, ou écris directement."
              className="field w-full resize-y text-sm leading-relaxed"
            />
          </div>

          {error && (
            <p className="rounded-field bg-live/10 px-3 py-2 text-xs text-live">
              {error}
            </p>
          )}
          {done && (
            <p className="flex items-center gap-1 rounded-field bg-online/10 px-3 py-2 text-xs text-online">
              <Check size={13} />
              {done === "send" ? "Réponse envoyée." : "Brouillon créé dans Gmail."}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-line p-4">
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={busy !== null || done !== null}
            className="btn-secondary flex-1 disabled:opacity-50"
          >
            <FileText size={15} />
            {busy === "draft" ? "…" : "Brouillon Gmail"}
          </button>
          <button
            type="button"
            onClick={() => submit("send")}
            disabled={busy !== null || done !== null || !canSend}
            title={
              canSend
                ? undefined
                : "Reconnecte ton compte Google pour activer l'envoi direct"
            }
            className="btn-primary flex-1 disabled:opacity-50"
          >
            <Send size={15} />
            {busy === "send" ? "Envoi…" : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}
