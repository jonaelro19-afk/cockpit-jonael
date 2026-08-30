"use client";
// Rend le HTML d'une notion + fait le rendu des maths ($...$) avec KaTeX.

import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";

export default function NotionContent({ html }: { html: string }) {
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
      /* maths invalides : on laisse le texte brut */
    }
  }, [html]);

  return (
    <div
      ref={ref}
      className="carnet-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
