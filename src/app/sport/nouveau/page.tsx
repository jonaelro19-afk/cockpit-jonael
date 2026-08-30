import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import ActivityForm from "../ActivityForm";
import { createActivity } from "../actions";
import { auth } from "@/auth";

export default async function NewActivityPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  return (
    <>
      <PageHeader
        title="Nouvelle séance"
        action={
          <Link
            href="/sport"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Sport
          </Link>
        }
      />
      <Card>
        <ActivityForm action={createActivity} submitLabel="Enregistrer" />
      </Card>
    </>
  );
}
