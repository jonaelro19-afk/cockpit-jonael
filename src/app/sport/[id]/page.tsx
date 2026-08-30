import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import ActivityForm from "../ActivityForm";
import { updateActivity, deleteActivity } from "../actions";
import { auth } from "@/auth";
import { getActivity, fmtDuration, fmtDistance, fmtPace } from "@/lib/sport";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) notFound();

  const updateWithId = updateActivity.bind(null, id);
  const deleteWithId = deleteActivity.bind(null, id);

  return (
    <>
      <PageHeader
        title={activity.title || activity.type}
        subtitle={new Date(activity.date).toLocaleString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}
        action={
          <Link
            href="/sport"
            className="text-sm font-medium text-muted hover:text-text hover:underline"
          >
            ← Sport
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat value={fmtDuration(activity.durationSec)} label="durée" />
        <Stat value={fmtDistance(activity.distanceM)} label="distance" />
        <Stat
          value={
            activity.type === "Course"
              ? fmtPace(activity.durationSec, activity.distanceM)
              : activity.distanceM
                ? `${(activity.distanceM / 1000 / (activity.durationSec / 3600)).toFixed(1)} km/h`
                : "—"
          }
          label={activity.type === "Course" ? "allure" : "vitesse"}
        />
        <Stat
          value={activity.avgHr ? `${activity.avgHr} bpm` : "—"}
          label="FC moyenne"
        />
      </div>

      <Card title="Modifier" className="mb-5">
        <ActivityForm
          action={updateWithId}
          activity={activity}
          submitLabel="Mettre à jour"
        />
      </Card>

      <form action={deleteWithId}>
        <button
          type="submit"
          className="text-sm font-medium text-live hover:underline"
        >
          Supprimer cette séance
        </button>
      </form>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card>
      <p className="text-xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
