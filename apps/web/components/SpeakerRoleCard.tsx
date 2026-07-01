"use client";

import { Edit3, Repeat2, ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { SpeakerMapping, SpeakerRole } from "@/lib/types";

export function SpeakerRoleCard({
  speakers,
  onConfirm,
  onSwap,
  onEdit,
  onRename
}: {
  speakers: SpeakerMapping[];
  onConfirm: () => void;
  onSwap: () => void;
  onEdit: (label: string, role: SpeakerRole) => void;
  onRename: (label: string, displayName: string) => void;
}) {
  const needsConfirmation = speakers.some((speaker) => !speaker.confirmedByUser || speaker.confidence < 0.8);
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Detected Speakers</h3>
        {needsConfirmation ? (
          <p className="mt-1 text-sm text-clay">Speaker roles need confirmation before final note generation.</p>
        ) : (
          <p className="mt-1 text-sm text-moss">Speaker roles confirmed by practitioner.</p>
        )}
      </div>
      {speakers.length === 0 ? (
        <p className="rounded-md border border-dashed border-moss/25 p-5 text-sm text-ink/60">
          Speaker role detection will appear once transcript segments are available.
        </p>
      ) : (
        <div className="space-y-3">
          {speakers.map((speaker) => (
            <div key={speaker.originalSpeakerLabel} className="rounded-md border border-moss/15 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{speaker.displayName || speaker.originalSpeakerLabel}</p>
                  <p className="text-xs text-ink/55">
                    {speaker.originalSpeakerLabel} to {speaker.assignedRole}
                  </p>
                </div>
                <span className="rounded bg-moss/10 px-2 py-1 text-xs text-moss">
                  {Math.round(speaker.confidence * 100)}%
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                <label className="block text-xs font-medium text-ink/60">
                  Display name
                  <input
                    className="mt-1 w-full rounded-md border border-moss/20 bg-white px-2 py-2 text-sm text-ink"
                    value={speaker.displayName}
                    onChange={(event) => onRename(speaker.originalSpeakerLabel, event.target.value)}
                  />
                </label>
                <label className="block text-xs font-medium text-ink/60">
                  Role
                  <select
                    className="mt-1 w-full rounded-md border border-moss/20 bg-white px-2 py-2 text-sm text-ink"
                    value={speaker.assignedRole}
                    onChange={(event) => onEdit(speaker.originalSpeakerLabel, event.target.value as SpeakerRole)}
                  >
                    <option>Client</option>
                    <option>Practitioner</option>
                    <option>Unassigned</option>
                  </select>
                </label>
              </div>
              <details className="mt-2 text-sm text-ink/70">
                <summary className="cursor-pointer text-xs font-medium text-ink/55">Evidence</summary>
                <ul className="mt-2 space-y-1">
                  {speaker.evidence.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onConfirm} disabled={speakers.length === 0}>
          <ShieldCheck size={16} aria-hidden />
          Confirm
        </Button>
        <Button variant="secondary" onClick={onSwap} disabled={speakers.length < 2}>
          <Repeat2 size={16} aria-hidden />
          Swap Roles
        </Button>
        <Button variant="ghost" onClick={onConfirm} disabled={speakers.length === 0}>
          <Edit3 size={16} aria-hidden />
          Save Edits
        </Button>
      </div>
    </div>
  );
}
