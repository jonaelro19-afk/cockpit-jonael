import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import ClientForm from "../../ClientForm";
import { createClient } from "../../actions";
import { auth } from "@/auth";

export default async function NewClientPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  return (
    <>
      <PageHeader
        title="Nouveau client"
        action={
          <Link
            href="/mj/clients"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Clients
          </Link>
        }
      />
      <Card>
        <ClientForm action={createClient} submitLabel="Créer le client" />
      </Card>
    </>
  );
}
