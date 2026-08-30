import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EquipmentCard from "../EquipmentCard";
import { updateEquipment, deleteEquipment } from "../actions";
import { auth } from "@/auth";
import { getEquipmentItem } from "@/lib/mj";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const item = await getEquipmentItem(id);
  if (!item) notFound();

  const updateWithId = updateEquipment.bind(null, id);
  const deleteWithId = deleteEquipment.bind(null, id);

  return (
    <>
      <PageHeader
        title={item.name}
        subtitle={item.category}
        action={
          <Link
            href="/mj/suivi"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Suivi
          </Link>
        }
      />

      <EquipmentCard item={item} updateAction={updateWithId} />

      <form action={deleteWithId} className="mt-5">
        <button
          type="submit"
          className="text-sm font-medium text-live hover:underline"
        >
          Supprimer cet article
        </button>
      </form>
    </>
  );
}
