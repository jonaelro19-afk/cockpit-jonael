"use client";

import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";

// Affiche la fiche mise en forme sur le "papier petits carreaux".
export default function FicheView({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      renderMathInElement(ref.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    } catch {
      /* maths invalides : on garde le texte brut */
    }
  }, [html]);

  return (
    <div
      ref={ref}
      className="fiche-papier"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
