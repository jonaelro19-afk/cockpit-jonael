import Card from "./Card";

// Bloc "à construire" — placeholder pendant qu'on développe module par module.
export default function ComingSoon({
  what,
  points,
}: {
  what: string;
  points?: string[];
}) {
  return (
    <Card>
      <p className="text-sm text-text">🚧 {what}</p>
      {points && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          {points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
