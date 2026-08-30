// Registre central des modules du cockpit.
// Sert à construire la navigation ET les cartes du Dashboard.

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarClock,
  GraduationCap,
  Activity,
  Clapperboard,
  Mail,
  ListChecks,
  Settings,
} from "lucide-react";

export type ModuleDef = {
  key: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  // Couleur d'accent du module (hex, pour pastilles / dégradés).
  color: string;
  children?: { label: string; href: string }[];
};

export const modules: ModuleDef[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/",
    Icon: LayoutDashboard,
    color: "#818cf8",
  },
  {
    key: "timebox",
    label: "Timebox",
    href: "/timebox",
    Icon: CalendarClock,
    color: "#38bdf8",
  },
  {
    key: "bts",
    label: "BTS",
    href: "/bts",
    Icon: GraduationCap,
    color: "#a78bfa",
  },
  {
    key: "sport",
    label: "Sport",
    href: "/sport",
    Icon: Activity,
    color: "#34d399",
  },
  {
    key: "mj",
    label: "M&J Prod",
    href: "/mj",
    Icon: Clapperboard,
    color: "#f472b6",
    children: [
      { label: "Vue d'ensemble", href: "/mj" },
      { label: "Clients", href: "/mj/clients" },
      { label: "Devis", href: "/mj/devis" },
      { label: "Suivi matériel", href: "/mj/suivi" },
    ],
  },
  {
    key: "gmail",
    label: "Gmail",
    href: "/gmail",
    Icon: Mail,
    color: "#fbbf24",
  },
  {
    key: "taches",
    label: "Tâches",
    href: "/taches",
    Icon: ListChecks,
    color: "#f59e0b",
  },
];

export const settingsModule: ModuleDef = {
  key: "parametres",
  label: "Paramètres",
  href: "/parametres",
  Icon: Settings,
  color: "#9a9a9e",
};

export const moduleByKey = Object.fromEntries(
  modules.map((m) => [m.key, m]),
) as Record<string, ModuleDef>;
