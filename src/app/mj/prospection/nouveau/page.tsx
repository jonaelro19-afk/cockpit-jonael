import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import MjTabs from "../../MjTabs";
import ProspectForm from "../ProspectForm";
import { createProspect } from "../actions";
import { auth } from "@/auth";

export default async function NewProspectPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  return (
    <>
      <PageHeader
        title="M&J Prod"
        subtitle="Nouveau prospect"
        action={
          <Link
            href="/mj/prospection"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Retour
          </Link>
        }
      />
      <MjTabs />
      <Card>
        <ProspectForm action={createProspect} submitLabel="Créer le prospect" />
      </Card>
    </>
  );
}
