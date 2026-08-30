"use client";
// Encadré infos projet : lecture seule par défaut, bouton "Modifier"
// en bas à droite pour éditer, "Enregistrer" / "Annuler" ensuite.

import { useState } from "react";
import Badge from "@/components/Badge";
import ProjectForm from "./ProjectForm";
import { statusMeta, fmtEur, fmtDateTime, relativeDays } from "@/lib/mj-shared";
import type { Project, Client } from "@/generated/prisma/client";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-2">
      <span className="w-28 shrink-0 text-xs text-muted">{label}</span>
      <span className="text-sm text-text">{children}</span>
    </div>
  );
}

export default function ProjectCard({
  project,
  clients,
  updateAction,
}: {
  project: Project & { client: Client | null };
  clients: Client[];
  updateAction: (fd: FormData) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const meta = statusMeta[project.status] ?? statusMeta.Devis;

  return (
    <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Projet
      </h2>

      {editing ? (
        <ProjectForm
          action={updateAction}
          project={project}
          clients={clients}
          submitLabel="Enregistrer"
          secondaryAction={
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-ghost"
            >
              Annuler
            </button>
          }
        />
      ) : (
        <>
          <div className="divide-y divide-line">
            <Row label="Client">{project.client?.name ?? "—"}</Row>
            <Row label="Statut">
              <Badge color={meta.badge}>{project.status}</Badge>
            </Row>
            <Row label="Type">{project.kind}</Row>
            <Row label="Tournage">{fmtDateTime(project.shootDate)}</Row>
            <Row label="Livraison">
              {fmtDateTime(project.deadline)}
              {project.deadline && (
                <span className="ml-2 text-xs text-muted">
                  {relativeDays(project.deadline)}
                </span>
              )}
            </Row>
            <Row label="Budget">
              <span className="font-semibold text-lime">
                {fmtEur(project.budgetEur)}
              </span>
            </Row>
            <Row label="Notes">
              <span className="whitespace-pre-wrap">
                {project.notes.trim() || "—"}
              </span>
            </Row>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-secondary"
            >
              Modifier
            </button>
          </div>
        </>
      )}
    </section>
  );
}
