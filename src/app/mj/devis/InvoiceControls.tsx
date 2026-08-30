"use client";

import { useTransition } from "react";
import { ReceiptEuro, Check } from "lucide-react";
import { convertToInvoice, setInvoicePaid } from "./actions";

export function ConvertButton({
  id,
  disabled,
}: {
  id: string;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={() => start(() => convertToInvoice(id))}
      className="btn-primary disabled:opacity-50"
      title={disabled ? "Passe le devis en « Accepté » d'abord" : undefined}
    >
      <ReceiptEuro size={15} /> {pending ? "…" : "Convertir en facture"}
    </button>
  );
}

export function PaidToggle({ id, paid }: { id: string; paid: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setInvoicePaid(id, !paid))}
      className={
        paid
          ? "chip border border-online/40 bg-online/15 text-online"
          : "btn-secondary"
      }
    >
      {paid ? (
        <>
          <Check size={14} /> Payée
        </>
      ) : (
        "Marquer payée"
      )}
    </button>
  );
}
