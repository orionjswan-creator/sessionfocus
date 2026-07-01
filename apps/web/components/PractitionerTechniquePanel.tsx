import { PractitionerTechniqueObservation } from "@/lib/types";
import { formatTimestamp } from "@/lib/time";

export function PractitionerTechniquePanel({ techniques }: { techniques: PractitionerTechniqueObservation[] }) {
  return (
    <div className="space-y-3">
      {techniques.length === 0 ? (
        <p className="rounded-md border border-dashed border-moss/25 p-5 text-sm text-ink/60">
          Practitioner technique observations will be generated after the final pass.
        </p>
      ) : (
        techniques.map((technique) => (
          <div key={technique.id} className="rounded-md border border-moss/15 bg-white p-4">
            <p className="text-sm font-semibold">{technique.techniqueType}</p>
            <p className="mt-1 text-xs text-ink/60">
              {formatTimestamp(technique.startTime)}-{formatTimestamp(technique.endTime)}
            </p>
            <p className="mt-3 text-sm text-ink/75">{technique.observation}</p>
            <p className="mt-2 text-sm text-ink/65">Evidence: "{technique.evidenceText}"</p>
          </div>
        ))
      )}
    </div>
  );
}
