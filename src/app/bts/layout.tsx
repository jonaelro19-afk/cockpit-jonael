import type { ReactNode } from "react";
import { Patrick_Hand } from "next/font/google";
import "./carnet.css";
import "./fiche.css";
import "katex/dist/katex.min.css";

// Police "écriture à la main" pour les fiches de révision.
const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fiche",
  display: "swap",
});

export default function BtsLayout({ children }: { children: ReactNode }) {
  return <div className={patrickHand.variable}>{children}</div>;
}
