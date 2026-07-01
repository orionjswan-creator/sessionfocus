"use client";

import { NoteBundle } from "@/lib/types";

export function DAPNoteEditor({ note, onChange }: { note: NoteBundle; onChange: (note: NoteBundle) => void }) {
  return (
    <div className="space-y-3">
      {(["data", "assessment", "plan"] as const).map((field) => (
        <label key={field} className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-ink/55">{field}</span>
          <textarea
            className="min-h-28 w-full rounded-md border border-moss/25 bg-white px-3 py-2 text-sm leading-6"
            value={note.dapNote[field]}
            onChange={(event) => onChange({ ...note, dapNote: { ...note.dapNote, [field]: event.target.value } })}
          />
        </label>
      ))}
    </div>
  );
}
