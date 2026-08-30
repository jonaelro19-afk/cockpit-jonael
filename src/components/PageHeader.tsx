import type { ReactNode } from "react";

/*
  Titre en haut de chaque page, avec sous-titre et zone d'action optionnels.
*/
export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
