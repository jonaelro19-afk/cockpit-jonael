"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";
import type { SchemaKind } from "@/lib/fiche-doc";

const INK = "#1b3a8f";
const PENCIL = "#3a3a4a";

type Props = {
  kind: SchemaKind;
  etiquettes?: Record<string, string>;
  legende?: string;
};

// Petit croquis "dessiné à la main" (rough.js). L'IA choisit le type et
// fournit les étiquettes — elle ne dessine jamais la géométrie elle-même.
export default function FicheSchema({ kind, etiquettes = {}, legende }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);
    const o = { roughness: 1.7, bowing: 1.4, stroke: PENCIL, strokeWidth: 1.6 };

    const label = (x: number, y: number, text: string, color = PENCIL) => {
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", String(x));
      t.setAttribute("y", String(y));
      t.setAttribute("fill", color);
      t.setAttribute("font-size", "15");
      t.setAttribute("font-family", "var(--font-fiche-body, sans-serif)");
      t.textContent = text;
      svg.appendChild(t);
    };

    if (kind === "triangle-rectangle") {
      // sommets : A haut-gauche, B bas-gauche (angle droit), C bas-droite
      const A: [number, number] = [40, 30];
      const B: [number, number] = [40, 150];
      const C: [number, number] = [210, 150];
      svg.appendChild(rc.linearPath([A, B, C, A], { ...o, stroke: INK }));
      // marque de l'angle droit en B
      svg.appendChild(
        rc.linearPath(
          [
            [B[0], B[1] - 18],
            [B[0] + 18, B[1] - 18],
            [B[0] + 18, B[1]],
          ],
          { ...o, strokeWidth: 1.2 },
        ),
      );
      label(6, 95, etiquettes.c ?? "c");
      label(115, 168, etiquettes.b ?? "b");
      label(135, 80, etiquettes.a ?? "a", INK);
    }

    if (kind === "repere") {
      svg.appendChild(rc.line(30, 150, 235, 150, o)); // axe x
      svg.appendChild(rc.line(45, 165, 45, 20, o)); // axe y
      // pointes de flèche
      svg.appendChild(rc.linearPath([[228, 144], [238, 150], [228, 156]], o));
      svg.appendChild(rc.linearPath([[39, 28], [45, 18], [51, 28]], o));
      label(238, 155, etiquettes.x ?? "x", INK);
      label(34, 20, etiquettes.y ?? "y", INK);
      label(30, 168, etiquettes.o ?? "O");
    }

    if (kind === "etapes") {
      const steps = ["e1", "e2", "e3", "e4"]
        .map((k) => etiquettes[k])
        .filter(Boolean) as string[];
      const n = Math.max(2, Math.min(4, steps.length || 3));
      const w = 250 / n - 8;
      steps.slice(0, n).forEach((s, i) => {
        const x = i * (w + 12) + 4;
        svg.appendChild(
          rc.rectangle(x, 55, w, 46, { ...o, stroke: INK, fill: "#fff7d6", fillStyle: "solid" }),
        );
        label(x + 8, 82, s.slice(0, 14));
        if (i < n - 1)
          svg.appendChild(
            rc.linearPath(
              [
                [x + w + 2, 78],
                [x + w + 12, 78],
              ],
              o,
            ),
          );
      });
    }
  }, [kind, etiquettes]);

  return (
    <figure className="f-schema">
      <svg
        ref={svgRef}
        viewBox="0 0 250 180"
        className="mx-auto block w-full max-w-[280px]"
      />
      {legende && <figcaption>{legende}</figcaption>}
    </figure>
  );
}
