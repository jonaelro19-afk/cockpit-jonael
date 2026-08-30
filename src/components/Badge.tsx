import type { ReactNode } from "react";

/*
  Pastille pilule pour un statut / une catégorie.
  Couleurs pensées pour fond sombre : teinte translucide + texte clair.
  Les couleurs "réservées" (live / lime / online) portent du sens.
*/
type Color =
  | "gray"
  | "indigo"
  | "green" // = online
  | "amber"
  | "red" // = live
  | "blue"
  | "purple"
  | "sky"
  | "lime";

const colorClasses: Record<Color, string> = {
  gray: "bg-white/[0.08] text-muted",
  indigo: "bg-indigo-400/[0.15] text-indigo-300",
  green: "bg-[#34C759]/[0.16] text-[#5DD97E]",
  amber: "bg-amber-400/[0.15] text-amber-300",
  red: "bg-[#FF3B30]/[0.16] text-[#FF6A5F]",
  blue: "bg-sky-400/[0.15] text-sky-300",
  purple: "bg-violet-400/[0.15] text-violet-300",
  sky: "bg-sky-400/[0.15] text-sky-300",
  lime: "bg-[#D6FF3C]/[0.15] text-[#D6FF3C]",
};

export default function Badge({
  children,
  color = "gray",
}: {
  children: ReactNode;
  color?: Color;
}) {
  return <span className={`chip ${colorClasses[color]}`}>{children}</span>;
}
