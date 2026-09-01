"use client";

import { useState } from "react";
import { Image as ImageIcon, FileDown } from "lucide-react";
import { toPng } from "html-to-image";

function slug(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase() || "fiche"
  );
}

async function capture(): Promise<string> {
  const node = document.querySelector<HTMLElement>("[data-fiche]");
  if (!node) throw new Error("Fiche introuvable");
  await document.fonts?.ready;
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#fdf3d7",
  });
}

export default function FicheExport({ title }: { title: string }) {
  const [busy, setBusy] = useState<null | "png" | "pdf">(null);

  const savePng = async () => {
    setBusy("png");
    try {
      const url = await capture();
      const a = document.createElement("a");
      a.href = url;
      a.download = `fiche-${slug(title)}.png`;
      a.click();
    } finally {
      setBusy(null);
    }
  };

  const savePdf = async () => {
    setBusy("pdf");
    try {
      const url = await capture();
      const img = new Image();
      img.src = url;
      await img.decode();
      const { jsPDF } = await import("jspdf");
      const A4W = 210;
      const A4H = 297;
      const pdfH = (A4W * img.height) / img.width;
      // Fiche plus longue qu'une A4 → page sur mesure, sinon A4 standard.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pdfH > A4H ? [A4W, pdfH] : "a4",
      });
      pdf.addImage(url, "PNG", 0, 0, A4W, pdfH);
      pdf.save(`fiche-${slug(title)}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={savePng}
        disabled={busy !== null}
        className="btn-secondary disabled:opacity-60"
      >
        <ImageIcon size={15} /> {busy === "png" ? "…" : "Image"}
      </button>
      <button
        type="button"
        onClick={savePdf}
        disabled={busy !== null}
        className="btn-primary disabled:opacity-60"
      >
        {busy === "pdf" ? (
          "…"
        ) : (
          <>
            <FileDown size={15} /> PDF
          </>
        )}
      </button>
    </div>
  );
}
