// Lecture d'un fichier Garmin .FIT → données de séance normalisées.
// Utilise le SDK officiel Garmin (@garmin/fitsdk).

import { createHash } from "node:crypto";
import { Decoder, Stream } from "@garmin/fitsdk";

export type ParsedActivity = {
  date: Date;
  type: "Course" | "Vélo" | "Muscu" | "Autre";
  title: string;
  durationSec: number;
  distanceM: number | null;
  elevationM: number | null;
  avgHr: number | null;
  maxHr: number | null;
  calories: number | null;
  externalId: string; // hash du contenu, pour dédupliquer
};

function mapSport(sport?: unknown, subSport?: unknown): ParsedActivity["type"] {
  const s = String(sport ?? "").toLowerCase();
  const sub = String(subSport ?? "").toLowerCase();
  if (s.includes("running")) return "Course";
  if (s.includes("cycling") || s.includes("biking")) return "Vélo";
  if (sub.includes("strength") || s === "training") return "Muscu";
  return "Autre";
}

export function parseFit(bytes: Uint8Array): ParsedActivity {
  const externalId = createHash("sha256").update(bytes).digest("hex").slice(0, 32);

  const stream = Stream.fromByteArray(bytes);
  const decoder = new Decoder(stream);
  if (!decoder.isFIT() || !decoder.checkIntegrity()) {
    throw new Error("Fichier .FIT invalide ou corrompu");
  }
  const { messages } = decoder.read({
    convertDateTimesToDates: true,
    expandSubFields: true,
  });

  const session = messages.sessionMesgs?.[0];
  if (!session) throw new Error("Aucune séance trouvée dans le fichier");

  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  const distance = num(session.totalDistance);
  const duration = num(session.totalTimerTime) ?? num(session.totalElapsedTime) ?? 0;

  return {
    date: session.startTime instanceof Date ? session.startTime : new Date(),
    type: mapSport(session.sport, session.subSport),
    title: "",
    durationSec: Math.round(duration),
    distanceM: distance,
    elevationM: num(session.totalAscent),
    avgHr: num(session.avgHeartRate),
    maxHr: num(session.maxHeartRate),
    calories: num(session.totalCalories),
    externalId,
  };
}
