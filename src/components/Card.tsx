import type { ReactNode } from "react";

/*
  Une "carte" : conteneur de base réutilisé partout.
  - children : contenu entre <Card> ... </Card>
  - title / action : optionnels
*/
type CardProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Card({
  title,
  action,
  children,
  className = "",
}: CardProps) {
  return (
    <section
      className={`rounded-card border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
