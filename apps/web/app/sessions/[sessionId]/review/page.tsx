"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { AudioPlayback } from "@/components/AudioPlayback";
import { Button } from "@/components/Button";
import { HighlightPanel } from "@/components/HighlightPanel";
import { LiveTranscript } from "@/components/LiveTranscript";
import { NoteEditor } from "@/components/NoteEditor";
import { Notice } from "@/components/Notice";
import { PractitionerTechniquePanel } from "@/components/PractitionerTechniquePanel";
import { SpeakerRoleCard } from "@/components/SpeakerRoleCard";
import { TopicSentimentPanel } from "@/components/TopicSentimentPanel";
import {
  analyzePractitionerTechniques,
  extractAssessment,
  generateNotes,
  summarizeTopics
} from "@/lib/analysis";
import { getRecord, mergeRecordUpdates, upsertRecord } from "@/lib/storage";
import { NoteBundle, SessionRecord, SpeakerMapping, SpeakerRole } from "@/lib/types";

export default function ReviewPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<SessionRecord | null>(null);
  const [activeTime, setActiveTime] = useState<number | undefined>();

  useEffect(() => {
    const loaded = getRecord(params.sessionId);
    if (!loaded) {
      router.push("/dashboard");
      return;
    }
    const ready = ensureGenerated(loaded);
    setRecord(ready);
    upsertRecord(ready);
  }, [params.sessionId, router]);

  function save(next: SessionRecord) {
    setRecord(next);
    upsertRecord(next);
  }

  function saveNote(note: NoteBundle) {
    if (!record) return;
    save(mergeRecordUpdates(record, { editedNotes: note }));
  }

  function finalize(note: NoteBundle) {
    if (!record) return;
    const session = {
      ...record.session,
      status: "Finalized" as const,
      updatedAt: new Date().toISOString()
    };
    save(mergeRecordUpdates(record, { session, editedNotes: note }));
  }

  function regenerate() {
    if (!record) return;
    const ready = ensureGenerated({ ...record, generatedNotes: undefined, editedNotes: undefined });
    save(ready);
  }

  function confirmSpeakers() {
    if (!record) return;
    const speakers = record.speakers.map((speaker) => ({ ...speaker, confirmedByUser: true }));
    save(regenerateForSpeakers(record, speakers));
  }

  function swapSpeakers() {
    if (!record) return;
    const speakers = record.speakers.map((speaker) => {
      const assignedRole: SpeakerRole =
        speaker.assignedRole === "Client"
          ? "Practitioner"
          : speaker.assignedRole === "Practitioner"
            ? "Client"
            : "Unassigned";
      return {
        ...speaker,
        assignedRole,
        displayName: defaultSpeakerName(assignedRole, record.session.clientAlias, speaker.originalSpeakerLabel),
        confirmedByUser: true
      };
    });
    save(regenerateForSpeakers(record, speakers));
  }

  function editSpeaker(label: string, role: SpeakerRole) {
    if (!record) return;
    const speakers = record.speakers.map((speaker) =>
      speaker.originalSpeakerLabel === label
        ? {
            ...speaker,
            assignedRole: role,
            displayName: defaultSpeakerName(role, record.session.clientAlias, speaker.originalSpeakerLabel),
            confirmedByUser: true
          }
        : speaker
    );
    save(regenerateForSpeakers(record, speakers));
  }

  function renameSpeaker(label: string, displayName: string) {
    if (!record) return;
    const speakers = record.speakers.map((speaker) =>
      speaker.originalSpeakerLabel === label ? { ...speaker, displayName, confirmedByUser: true } : speaker
    );
    save(regenerateForSpeakers(record, speakers));
  }

  if (!record) return null;
  const note = record.editedNotes ?? record.generatedNotes;

  return (
    <div className="mx-auto max-w-[1800px] px-5 py-6">
      <div className="mb-5">
        <Link href={`/sessions/${record.session.id}/live`} className="mb-2 inline-flex items-center gap-2 text-sm text-moss">
          <ArrowLeft size={15} aria-hidden />
          Live session
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Review and Finalize</h1>
        <p className="mt-1 text-sm text-ink/65">
          {record.session.clientAlias || "Client alias not set"} - {record.session.sessionType} - {record.session.status}
        </p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Notice tone="warning">AI-generated draft. Practitioner must review, edit, and confirm before use.</Notice>
        <Notice>
          Risk-like, safety-related, or mandated-reporting-related statements are flagged for practitioner review only.
          Absence of a flagged statement does not mean absence of risk or safety concern.
        </Notice>
        <Notice>Audio-only recordings cannot assess appearance, hygiene, eye contact, visual affect, or visual observations.</Notice>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1.25fr]">
        <section className="app-panel rounded-lg p-5">
          <h2 className="mb-4 text-lg font-semibold">Transcript and Audio</h2>
          <div className="mb-5">
            <AudioPlayback sessionId={record.session.id} chunkCount={record.audioChunks.length} />
          </div>
          <LiveTranscript
            segments={record.transcript}
            speakers={record.speakers}
            activeTime={activeTime}
            onSelect={(segment) => setActiveTime(segment.startTime)}
            compact
          />
          <p className="mt-3 text-xs leading-5 text-ink/55">
            Transcript is kept as capture evidence. Reassign speakers here, then edit key points and notes on the right.
          </p>
        </section>

        <section className="space-y-5">
          <div className="app-panel rounded-lg p-5">
            <h2 className="mb-4 text-lg font-semibold">Speaker Assignment</h2>
            <SpeakerRoleCard
              speakers={record.speakers}
              onConfirm={confirmSpeakers}
              onSwap={swapSpeakers}
              onEdit={editSpeaker}
              onRename={renameSpeaker}
            />
          </div>
          <div className="app-panel rounded-lg p-5">
            <h2 className="mb-4 text-lg font-semibold">Final Highlights</h2>
            <HighlightPanel highlights={record.highlights} onJump={setActiveTime} />
          </div>
          <div className="app-panel rounded-lg p-5">
            <h2 className="mb-4 text-lg font-semibold">Topic Sentiment and Needs</h2>
            <TopicSentimentPanel topics={record.topics} />
            <div className="mt-4 grid gap-2 text-sm">
              <Fact label="Client needs" values={record.assessment.clientNeeds} />
              <Fact label="Barriers" values={record.assessment.barriers} />
              <Fact label="Strengths" values={record.assessment.strengths} />
              <Fact label="Goals" values={record.assessment.goals} />
              <Fact label="Safety-like statements" values={record.assessment.safetyLikeStatements} />
              <Fact label="Mandated-reporting-like statements" values={record.assessment.mandatedReportingLikeStatements} />
            </div>
          </div>
          <div className="app-panel rounded-lg p-5">
            <h2 className="mb-4 text-lg font-semibold">Practitioner Technique</h2>
            <PractitionerTechniquePanel techniques={record.techniques} />
          </div>
        </section>

        <section className="app-panel rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Editable Notes</h2>
            <Button variant="secondary" onClick={() => note && saveNote(note)} disabled={!note}>
              <Save size={16} aria-hidden />
              Save
            </Button>
          </div>
          {note ? (
            <NoteEditor
              record={record}
              note={note}
              onSave={saveNote}
              onFinalize={finalize}
              onRegenerate={regenerate}
            />
          ) : (
            <p>No generated note is available.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function ensureGenerated(record: SessionRecord): SessionRecord {
  const transcript = record.transcript.map((segment) => ({ ...segment, isFinal: true }));
  const topics = record.topics.length ? record.topics : summarizeTopics(record.session.id, transcript);
  const assessment = extractAssessment(transcript);
  const techniques = record.techniques.length ? record.techniques : analyzePractitionerTechniques(transcript);
  const generatedNotes =
    record.generatedNotes ?? generateNotes(record.session, transcript, record.highlights, topics, assessment);
  return mergeRecordUpdates(record, {
    transcript,
    topics,
    assessment,
    techniques,
    generatedNotes
  });
}

function regenerateForSpeakers(record: SessionRecord, speakers: SpeakerMapping[]): SessionRecord {
  const normalizedSpeakers = speakers.map((speaker) => ({
    ...speaker,
    displayName:
      speaker.displayName ||
      defaultSpeakerName(speaker.assignedRole, record.session.clientAlias, speaker.originalSpeakerLabel)
  }));
  const transcript = record.transcript.map((segment) => {
    const mapping = normalizedSpeakers.find((speaker) => speaker.originalSpeakerLabel === segment.speakerLabel);
    return mapping ? { ...segment, speakerRole: mapping.assignedRole } : segment;
  });
  const topics = summarizeTopics(record.session.id, transcript);
  const assessment = extractAssessment(transcript);
  const techniques = analyzePractitionerTechniques(transcript);
  const generatedNotes = generateNotes(record.session, transcript, record.highlights, topics, assessment);
  return mergeRecordUpdates(record, {
    speakers: normalizedSpeakers,
    transcript,
    topics,
    assessment,
    techniques,
    generatedNotes,
    editedNotes: undefined
  });
}

function defaultSpeakerName(role: SpeakerRole, clientAlias: string, fallback: string): string {
  if (role === "Client") return clientAlias.trim() || "Client";
  if (role === "Practitioner") return "Practitioner";
  return fallback === "Speaker 0" ? "Captured speaker" : fallback;
}

function Fact({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded-md border border-moss/15 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-ink/50">{label}</p>
      <p className="mt-1 text-ink/75">{values.length ? values.join("; ") : "not discussed"}</p>
    </div>
  );
}
