"use client";

import { useEffect, useState } from "react";
import { Lock, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { Notice } from "./Notice";
import { CaseNoteEditor } from "./CaseNoteEditor";
import { DAPNoteEditor } from "./DAPNoteEditor";
import { PsychosocialSummaryEditor } from "./PsychosocialSummaryEditor";
import { ResourceReferralPlanEditor } from "./ResourceReferralPlanEditor";
import { FollowUpTaskList } from "./FollowUpTaskList";
import { ExportPanel } from "./ExportPanel";
import { NoteBundle, SessionRecord } from "@/lib/types";

const tabs = [
  "Key Notes",
  "General Case Note",
  "DAP Note",
  "Psychosocial Summary",
  "Resource / Referral Plan",
  "Follow-Up Tasks",
  "Topic / Sentiment Summary",
  "Behavioral Observation",
  "Export"
] as const;

type Tab = (typeof tabs)[number];
type KeyListField = Exclude<keyof NoteBundle["keyNotes"], "presentingConcern">;

export function NoteEditor({
  record,
  note,
  onSave,
  onFinalize,
  onRegenerate
}: {
  record: SessionRecord;
  note: NoteBundle;
  onSave: (note: NoteBundle) => void;
  onFinalize: (note: NoteBundle) => void;
  onRegenerate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Key Notes");
  const [draft, setDraft] = useState<NoteBundle>(note);
  const finalized = Boolean(draft.finalizedAt);

  useEffect(() => {
    setDraft(note);
  }, [note]);

  function save() {
    onSave(draft);
  }

  return (
    <div className="space-y-4">
      <Notice tone="warning">AI-generated draft. Practitioner must review, edit, and confirm before use.</Notice>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
              activeTab === tab ? "border-moss bg-moss text-white" : "border-moss/20 bg-white text-ink hover:bg-linen"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[440px] rounded-md border border-moss/15 bg-linen/45 p-4">
        {activeTab === "Key Notes" ? <KeyNotes note={draft} onChange={setDraft} /> : null}
        {activeTab === "General Case Note" ? <CaseNoteEditor note={draft} onChange={setDraft} /> : null}
        {activeTab === "DAP Note" ? <DAPNoteEditor note={draft} onChange={setDraft} /> : null}
        {activeTab === "Psychosocial Summary" ? <PsychosocialSummaryEditor note={draft} onChange={setDraft} /> : null}
        {activeTab === "Resource / Referral Plan" ? (
          <ResourceReferralPlanEditor note={draft} onChange={setDraft} />
        ) : null}
        {activeTab === "Follow-Up Tasks" ? (
          <FollowUpTaskList
            tasks={draft.followUpTaskList}
            onChange={(tasks) => setDraft({ ...draft, followUpTaskList: tasks })}
          />
        ) : null}
        {activeTab === "Topic / Sentiment Summary" ? <ReadOnlyJson value={draft.topicSentimentSummary} /> : null}
        {activeTab === "Behavioral Observation" ? (
          <ReadOnlyJson
            value={draft.optionalBehavioralObservation}
            onChange={(value) => setDraft({ ...draft, optionalBehavioralObservation: value as Record<string, string> })}
          />
        ) : null}
        {activeTab === "Export" ? <ExportPanel record={{ ...record, editedNotes: draft }} /> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={save}>
          <Save size={16} aria-hidden />
          Save Edits
        </Button>
        <Button variant="secondary" onClick={onRegenerate} disabled={finalized}>
          {finalized ? <Lock size={16} aria-hidden /> : <RotateCcw size={16} aria-hidden />}
          Regenerate Draft
        </Button>
        <Button onClick={() => onFinalize({ ...draft, finalizedAt: new Date().toISOString() })}>
          <ShieldCheck size={16} aria-hidden />
          Finalize
        </Button>
      </div>
      {draft.finalizedAt ? (
        <p className="text-sm text-moss">Finalized at {new Date(draft.finalizedAt).toLocaleString()}.</p>
      ) : null}
    </div>
  );
}

function KeyNotes({ note, onChange }: { note: NoteBundle; onChange: (note: NoteBundle) => void }) {
  function setList(field: KeyListField, value: string) {
    onChange({ ...note, keyNotes: { ...note.keyNotes, [field]: value.split("\n").filter(Boolean) } });
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-ink/55">Presenting concern</span>
        <textarea
          className="min-h-24 w-full rounded-md border border-moss/25 bg-white px-3 py-2 text-sm leading-6"
          value={note.keyNotes.presentingConcern}
          onChange={(event) =>
            onChange({ ...note, keyNotes: { ...note.keyNotes, presentingConcern: event.target.value } })
          }
        />
      </label>
      {([
        ["mainThemes", "Main themes"],
        ["clientNeeds", "Client needs"],
        ["barriers", "Barriers"],
        ["strengths", "Strengths"],
        ["goals", "Goals"],
        ["resourcesDiscussed", "Resources discussed"],
        ["followUpTasks", "Follow-up tasks"],
        ["itemsForPractitionerConfirmation", "Items for practitioner confirmation"]
      ] as [KeyListField, string][]).map(([field, label]) => (
        <label key={field} className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-ink/55">{label}</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-moss/25 bg-white px-3 py-2 text-sm leading-6"
            value={note.keyNotes[field].join("\n")}
            onChange={(event) => setList(field, event.target.value)}
          />
        </label>
      ))}
    </div>
  );
}

function ReadOnlyJson({
  value,
  onChange
}: {
  value: unknown;
  onChange?: (value: unknown) => void;
}) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  return (
    <textarea
      className="min-h-[380px] w-full rounded-md border border-moss/25 bg-white px-3 py-2 font-mono text-xs leading-5"
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        if (!onChange) return;
        try {
          onChange(JSON.parse(event.target.value));
        } catch {
          // Keep the user's draft text visible until it becomes valid JSON.
        }
      }}
      readOnly={!onChange}
    />
  );
}
