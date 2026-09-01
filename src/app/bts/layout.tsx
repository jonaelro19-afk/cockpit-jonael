import type { ReactNode } from "react";
import { Patrick_Hand, Caveat } from "next/font/google";
import "./carnet.css";
import "./fiche.css";
import "katex/dist/katex.min.css";

// Corps de la fiche : écriture manuscrite lisible.
const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fiche-body",
  display: "swap",
});

// Titres de la fiche : effet feutre.
const caveat = Caveat({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-fiche-titre",
  display: "swap",
});

export default function BtsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${patrickHand.variable} ${caveat.variable}`}>{children}</div>
  );
}
