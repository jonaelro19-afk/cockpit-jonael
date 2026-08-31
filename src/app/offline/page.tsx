import { WifiOff } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export const metadata = { title: "Hors-ligne — Cockpit" };

export default function OfflinePage() {
  return (
    <EmptyState
      Icon={WifiOff}
      title="Pas de connexion"
      hint="Le Cockpit a besoin d'internet pour afficher tes données. Reconnecte-toi puis réessaie."
    />
  );
}
