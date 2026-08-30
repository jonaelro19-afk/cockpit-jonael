"use client";
// Frise chronologique des projets M&J.
// - barres/marqueurs colorés par statut, épais
// - date de livraison affichée sur la frise
// - clic sur une ligne : elle s'agrandit et détaille dates / livrable / projet

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/Badge";
import {
  statusMeta,
  fmtEur,
  fmtDate,
  fmtDateTime,
  relativeDays,
} from "@/lib/mj-shared";

export type TimelineProject = {
  id: string;
  title: string;
  kind: string;
  status: string;
  clientName: string | null;
  shootDate: string | null; // ISO
  deadline: string | null; // ISO
  budgetEur: number | null;
  notes: string;
};

const DAY_W = 4.6;
const ROW_H = 46;
const ROW_H_OPEN = 188;
const LABEL_W = 158;
const HEAD_H = 30;

const dayMs = 86400000;
const days = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / dayMs);
const monthStart = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonths = (d: Date, n: number) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));

// Rouge si en retard ou < 3 jours, sinon discret.
function urgencyClass(deadline: string | null): string {
  if (!deadline) return "text-muted";
  const diff = days(new Date(new Date().setHours(0, 0, 0, 0)), new Date(deadline));
  return diff <= 3 ? "text-live" : "text-muted";
}

export default function Timeline({
  projects,
}: {
  projects: TimelineProject[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const dated = projects.filter((p) => p.deadline || p.shootDate);
  if (dated.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Aucun projet daté. Ajoute une date de livraison à un projet pour le voir
        ici.
      </p>
    );
  }

  const today = new Date();
  const times = dated
    .flatMap((p) => [p.shootDate, p.deadline])
    .filter((d): d is string => d != null)
    .map((d) => new Date(d).getTime());
  times.push(today.getTime());

  const min = new Date(Math.min(...times));
  const max = new Date(Math.max(...times));
  const origin = monthStart(min);
  let end = addMonths(monthStart(max), 1);
  if (days(origin, end) < 150) end = addMonths(origin, 6);

  const width = days(origin, end) * DAY_W;
  const x = (d: Date | string) => days(origin, new Date(d)) * DAY_W;

  // repères : mois (marqués) + semaines (discrets)
  const months: { label: string; left: number }[] = [];
  for (let m = new Date(origin); m < end; m = addMonths(m, 1)) {
    months.push({
      label: m.toLocaleDateString("fr-FR", { month: "long", year: "2-digit" }),
      left: x(m),
    });
  }
  const weeks: number[] = [];
  {
    const w = new Date(origin);
    while (w.getUTCDay() !== 1) w.setUTCDate(w.getUTCDate() + 1);
    for (; w < end; w.setUTCDate(w.getUTCDate() + 7)) weeks.push(x(new Date(w)));
  }

  const sorted = [...dated].sort(
    (a, b) =>
      new Date(a.deadline ?? a.shootDate!).getTime() -
      new Date(b.deadline ?? b.shootDate!).getTime(),
  );

  return (
    <div className="overflow-x-auto">
      <div
        className="relative"
        style={{ minWidth: LABEL_W + width + 24, paddingTop: HEAD_H }}
      >
        {/* Repères temporels */}
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: LABEL_W }}
        >
          {weeks.map((left) => (
            <div
              key={`w${left}`}
              className="absolute inset-y-0 border-l border-white/[0.04]"
              style={{ left }}
            />
          ))}
          {months.map((m) => (
            <div
              key={m.label + m.left}
              className="absolute inset-y-0 border-l border-white/[0.12]"
              style={{ left: m.left }}
            >
              <span className="absolute -top-[26px] left-2 text-xs font-semibold capitalize text-muted">
                {m.label}
              </span>
            </div>
          ))}
          <div
            className="absolute inset-y-0 border-l-2 border-live"
            style={{ left: x(today) }}
          >
            <span className="absolute -top-[26px] left-1 text-xs font-bold text-live">
              auj.
            </span>
          </div>
        </div>

        {/* Lignes de projets */}
        <div className="relative">
          {sorted.map((p) => {
            const meta = statusMeta[p.status] ?? statusMeta.Devis;
            const open = openId === p.id;
            const hasBar = p.shootDate && p.deadline;
            const point = p.deadline ?? p.shootDate!;

            return (
              <div
                key={p.id}
                className="flex border-b border-line last:border-0"
                style={{ height: open ? ROW_H_OPEN : ROW_H }}
              >
                {/* Étiquette (clic = ouvrir/fermer) */}
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : p.id)}
                  className="sticky left-0 z-10 flex shrink-0 items-start gap-2 bg-surface py-3 pr-3 text-left"
                  style={{ width: LABEL_W }}
                >
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: meta.bar }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-text">
                      {p.title}
                    </span>
                    {p.clientName && (
                      <span className="block truncate text-xs text-muted">
                        {p.clientName}
                      </span>
                    )}
                  </span>
                </button>

                {/* Zone temps */}
                <div className="relative flex-1" style={{ width }}>
                  {/* barre ou marqueur */}
                  {hasBar ? (
                    <div
                      className="absolute top-[18px] h-4 rounded-pill"
                      style={{
                        left: x(p.shootDate!),
                        width: Math.max(x(p.deadline!) - x(p.shootDate!), 10),
                        background: meta.bar,
                      }}
                    />
                  ) : null}
                  {/* tick précis à la livraison */}
                  <div
                    className="absolute top-[12px] h-8 w-1 rounded"
                    style={{ left: x(point), background: meta.bar }}
                  />
                  {/* date de livraison en clair */}
                  <span
                    className={`absolute top-[16px] whitespace-nowrap text-[11px] font-semibold ${urgencyClass(
                      p.deadline,
                    )}`}
                    style={{ left: x(point) + 10 }}
                  >
                    {fmtDate(point)}
                    <span className="ml-1.5 font-normal">
                      {relativeDays(p.deadline ?? point)}
                    </span>
                  </span>

                  {/* panneau détaillé */}
                  {open && (
                    <div
                      className="absolute left-2 right-4 top-[48px] rounded-field border border-line bg-elevated p-3 text-sm"
                      style={{ maxWidth: 460 }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Badge color={meta.badge}>{p.status}</Badge>
                        <span className="text-xs text-muted">{p.kind}</span>
                        {p.budgetEur != null && (
                          <span className="text-xs font-semibold text-lime">
                            {fmtEur(p.budgetEur)}
                          </span>
                        )}
                      </div>
                      <p className="text-text">
                        📦 <span className="font-semibold">Livraison :</span>{" "}
                        <span className={urgencyClass(p.deadline)}>
                          {fmtDateTime(p.deadline)}
                          {p.deadline && ` — ${relativeDays(p.deadline)}`}
                        </span>
                      </p>
                      {p.shootDate && (
                        <p className="text-muted">
                          🎬 Tournage : {fmtDateTime(p.shootDate)}
                        </p>
                      )}
                      {p.notes.trim() && (
                        <p className="mt-1.5 whitespace-pre-wrap text-xs text-muted">
                          {p.notes}
                        </p>
                      )}
                      <Link
                        href={`/mj/projets/${p.id}`}
                        className="mt-2 inline-block text-xs font-medium text-text hover:underline"
                      >
                        Ouvrir la fiche →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
