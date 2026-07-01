"use client";

import { NoteBundle } from "@/lib/types";

export function CaseNoteEditor({
  note,
  onChange
}: {
  note: NoteBundle;
  onChange: (note: NoteBundle) => void;
}) {
  return (
    <div className="space-y-3">
      <TextArea
        label="Summary"
        value={note.generalCaseNote.summary}
        onChange={(summary) => onChange({ ...note, generalCaseNote: { ...note.generalCaseNote, summary } })}
      />
      <TextArea
        label="Client reported"
        value={note.generalCaseNote.clientReported.join("\n")}
        onChange={(value) =>
          onChange({
            ...note,
            generalCaseNote: { ...note.generalCaseNote, clientReported: value.split("\n").filter(Boolean) }
          })
        }
      />
      <TextArea
        label="Practitioner actions"
        value={note.generalCaseNote.practitionerActions.join("\n")}
        onChange={(value) =>
          onChange({
            ...note,
            generalCaseNote: { ...note.generalCaseNote, practitionerActions: value.split("\n").filter(Boolean) }
          })
        }
      />
      <TextArea
        label="Plan"
        value={note.generalCaseNote.plan.join("\n")}
        onChange={(value) =>
          onChange({ ...note, generalCaseNote: { ...note.generalCaseNote, plan: value.split("\n").filter(Boolean) } })
        }
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-ink/55">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-md border border-moss/25 bg-white px-3 py-2 text-sm leading-6"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
