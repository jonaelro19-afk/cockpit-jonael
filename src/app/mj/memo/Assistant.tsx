"use client";

import { useRef, useState, useTransition } from "react";
import { Sparkles, Send, Eraser } from "lucide-react";
import { renderMdLite } from "@/lib/md-lite";
import { askAssistant, type AssistantMsg } from "./actions";

const SUGGESTIONS = [
  "Prépare mon appel avec un restaurant qui a un Instagram vide",
  "Rédige la section « pourquoi investir » d'un devis vidéo témoignage",
  "Quel prix proposer pour une vidéo de marque institutionnelle ?",
  "Donne-moi 3 arguments pour vendre à plus de 10 000 €",
];

export default function Assistant() {
  const [msgs, setMsgs] = useState<AssistantMsg[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  const send = (question: string) => {
    if (!question.trim() || pending) return;
    setError(null);
    const history = msgs;
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setQ("");
    start(async () => {
      const res = await askAssistant(question, history);
      if (res.ok) {
        setMsgs((m) => [...m, { role: "assistant", content: res.text }]);
        setTimeout(
          () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      } else {
        setError(res.error);
        setMsgs((m) => m.slice(0, -1)); // retire la question restée sans réponse
      }
    });
  };

  return (
    <div className="mb-6 rounded-card border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Sparkles size={15} className="text-[#f472b6]" />
          Assistant M&J
        </h2>
        {msgs.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMsgs([]);
              setError(null);
            }}
            className="flex items-center gap-1 text-xs text-muted hover:text-text"
          >
            <Eraser size={12} /> Effacer
          </button>
        )}
      </div>

      {msgs.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={pending}
              className="chip border border-line bg-surface-2 text-xs text-muted hover:text-text disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {msgs.length > 0 && (
        <div className="mb-3 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <p
                key={i}
                className="ml-auto max-w-[85%] rounded-field bg-surface-2 px-3 py-2 text-sm"
              >
                {m.content}
              </p>
            ) : (
              <div
                key={i}
                className="memo-body max-w-[95%] rounded-field border border-line bg-surface-2/40 px-3 py-2 text-sm"
                dangerouslySetInnerHTML={{ __html: renderMdLite(m.content) }}
              />
            ),
          )}
          {pending && (
            <p className="text-xs text-muted">L&apos;assistant réfléchit…</p>
          )}
          <div ref={endRef} />
        </div>
      )}

      {error && (
        <p className="mb-2 rounded-field bg-live/10 px-3 py-2 text-xs text-live">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(q);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(q);
            }
          }}
          rows={2}
          placeholder="Demande-lui un message client, une section de devis, un plan d'appel…"
          className="field w-full resize-none text-sm"
        />
        <button
          type="submit"
          disabled={pending || !q.trim()}
          className="btn-primary shrink-0 disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </form>
      <p className="mt-1.5 text-[11px] text-faint">
        Répond à partir des notes du Mémo (niche, offres, méthode de devis,
        approche client…).
      </p>
    </div>
  );
}
