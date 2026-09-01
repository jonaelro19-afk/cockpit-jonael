"use client";

import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";
import type { Block, FicheColumn, FicheDoc, Run } from "@/lib/fiche-doc";
import { normalizeFiche } from "@/lib/fiche-doc";
import FicheSchema from "./FicheSchema";

function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) => {
        let node: React.ReactNode = r.t;
        if (r.b) node = <b>{node}</b>;
        if (r.cle) node = <span className="f-cle">{node}</span>;
        if (r.hl === "jaune") node = <mark>{node}</mark>;
        if (r.hl === "vert") node = <mark className="f-vert">{node}</mark>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraphe":
      return (
        <p>
          <Runs runs={block.runs} />
        </p>
      );
    case "liste": {
      const items = block.items.map((it, i) => (
        <li key={i}>
          <Runs runs={it} />
        </li>
      ));
      return block.ordonnee ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case "definition":
      return (
        <p className="f-definition">
          <span className="f-cle">{block.terme}</span> :{" "}
          <Runs runs={block.runs} />
        </p>
      );
    case "formule":
      return <div className="f-formule">{block.texte}</div>;
    case "encadre":
      return (
        <div className={`f-box f-box--${block.variante}`}>
          <span className="f-box-label">
            {block.variante === "attention"
              ? "⚠ Attention"
              : block.variante === "astuce"
                ? "Astuce"
                : "À retenir"}
          </span>
          <span>
            <Runs runs={block.runs} />
          </span>
        </div>
      );
    case "schema":
      return (
        <FicheSchema
          kind={block.kind}
          etiquettes={block.etiquettes}
          legende={block.legende}
        />
      );
    default:
      return null;
  }
}

function ColumnView({ col }: { col: FicheColumn }) {
  return (
    <div className="f-colonne">
      {col.titre && <h3 className="f-soustitre">{col.titre}</h3>}
      {col.blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}

export default function Fiche({ doc }: { doc: FicheDoc }) {
  const ref = useRef<HTMLDivElement>(null);
  const d = normalizeFiche(doc);

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
      /* maths invalides : on garde le texte */
    }
  }, [doc]);

  return (
    <div ref={ref} className="fiche-papier" data-fiche>
      <h2 className="f-titre">{d.titre}</h2>
      {d.sousTitre && <p className="f-sous-titre">{d.sousTitre}</p>}

      <div
        className={d.disposition === "2col" ? "f-colonnes f-colonnes--2" : "f-colonnes"}
      >
        {d.colonnes.map((c, i) => (
          <ColumnView key={i} col={c} />
        ))}
      </div>

      {d.note && <p className="f-note">✎ {d.note}</p>}
    </div>
  );
}
