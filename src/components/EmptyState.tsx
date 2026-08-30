import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// État vide illustré et réutilisable.
export default function EmptyState({
  Icon,
  title,
  hint,
  action,
}: {
  Icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="relative mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 text-muted">
        <span
          className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
          style={{
            background: "linear-gradient(120deg,#ff7a3d,#ff4fa0,#b14fff)",
          }}
        />
        <Icon size={28} strokeWidth={1.5} className="relative" />
      </span>
      <p className="text-sm font-semibold text-text">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
