import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EquipmentForm from "../EquipmentForm";
import { createEquipment } from "../actions";
import { auth } from "@/auth";

export default async function NewEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ wishlist?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { wishlist: w } = await searchParams;
  const wishlist = w === "1";

  return (
    <>
      <PageHeader
        title={wishlist ? "Nouveau — à acheter" : "Nouveau matériel"}
        action={
          <Link
            href="/mj/suivi"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Suivi
          </Link>
        }
      />
      <Card>
        <EquipmentForm
          action={createEquipment}
          defaultStatus={wishlist ? "à acheter" : "possédé"}
          submitLabel="Ajouter"
        />
      </Card>
    </>
  );
}
