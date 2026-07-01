"use client";

import { NoteBundle } from "@/lib/types";

const fields = ["resourceNeeds", "resourcesDiscussed", "referralsDiscussed", "consentOrReleaseItems", "nextSteps"] as const;

export function ResourceReferralPlanEditor({
  note,
  onChange
}: {
  note: NoteBundle;
  onChange: (note: NoteBundle) => void;
}) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <label key={field} className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-ink/55">
            {field.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`)}
          </span>
          <textarea
            className="min-h-24 w-full rounded-md border border-moss/25 bg-white px-3 py-2 text-sm leading-6"
            value={note.resourceReferralPlan[field].join("\n")}
            onChange={(event) =>
              onChange({
                ...note,
                resourceReferralPlan: {
                  ...note.resourceReferralPlan,
                  [field]: event.target.value.split("\n").filter(Boolean)
                }
              })
            }
          />
        </label>
      ))}
    </div>
  );
}
