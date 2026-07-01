"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, RotateCcw } from "lucide-react";
import { AudioRecorder, SpeechResult } from "@/components/AudioRecorder";
import { Button } from "@/components/Button";
import { HighlightPanel } from "@/components/HighlightPanel";
import { LiveTranscript } from "@/components/LiveTranscript";
import { Notice } from "@/components/Notice";
import { RollingAnalysisPanel } from "@/components/RollingAnalysisPanel";
import { SpeakerRoleCard } from "@/components/SpeakerRoleCard";
import { TopicSentimentPanel } from "@/components/TopicSentimentPanel";
import {
  analyzePractitionerTechniques,
  classifySpeakers,
  detectHighlight,
  extractAssessment,
  generateNotes,
  makeId,
  summarizeTopics
} from "@/lib/analysis";
import { clearAudioChunks, saveAudioChunk } from "@/lib/audioStorage";
import { getRecord, mergeRecordUpdates, upsertRecord } from "@/lib/storage";
import { AssessmentBundle, SessionRecord, SpeakerMapping, SpeakerRole, TranscriptSegment } from "@/lib/types";

export default function LiveSessionPage() {
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
    const normalized = normalizeRecordSpeakerNames(loaded);
    setRecord(normalized);
    if (normalized !== loaded) upsertRecord(normalized);
  }, [params.sessionId, router]);

  function save(next: SessionRecord) {
    setRecord(next);
    upsertRecord(next);
  }

  function onStateChange(state: "idle" | "recording" | "paused" | "ended") {
    if (!record || state !== "recording") return;
    save({
      ...record,
      session: { ...record.session, status: "Recording", updatedAt: new Date().toISOString() }
    });
  }

  function onChunk(chunk: Blob) {
    setRecord((current) => {
      if (!current) return current;
      const index = current.audioChunks.length;
      void saveAudioChunk(current.session.id, index, chunk);
      const audioChunks = [
        ...current.audioChunks,
        {
          id: makeId("chunk"),
          index,
          createdAt: new Date().toISOString(),
          size: chunk.size
        }
      ];
      const next = { ...current, audioChunks };
      upsertRecord(next);
      return next;
    });
  }

  function onSpeechResult(result: SpeechResult) {
    setRecord((current) => {
      if (!current) return current;
      const role = current.speakers.find((speaker) => speaker.originalSpeakerLabel === "Speaker 0")?.assignedRole ?? "Unassigned";
      const segment: TranscriptSegment = {
        id: result.isFinal ? makeId("seg") : "speech-interim",
        sessionId: current.session.id,
        temporarySegmentId: result.isFinal ? undefined : "speech-interim",
        speakerLabel: "Speaker 0",
        speakerRole: role,
        startTime: Math.max(0, result.elapsedSeconds - estimateSpeechDuration(result.text)),
        endTime: Math.max(1, result.elapsedSeconds),
        text: result.text,
        confidence: result.confidence,
        isFinal: result.isFinal,
        createdAt: new Date().toISOString()
      };
      const existingInterim = current.transcript.findIndex((candidate) => candidate.temporarySegmentId === "speech-interim");
      const transcript =
        existingInterim === -1
          ? [...current.transcript, segment]
          : current.transcript.map((candidate, index) => (index === existingInterim ? segment : candidate));
      const speakers = normalizeSpeakerNames(ensureRealSpeechSpeaker(current.speakers), current.session.clientAlias);
      const finalTranscript = transcript.filter((candidate) => candidate.isFinal);
      const finalHighlights = result.isFinal
        ? addHighlight(current.highlights, detectHighlight(segment))
        : current.highlights;
      const topics = summarizeTopics(current.session.id, finalTranscript);
      const assessment = extractAssessment(finalTranscript);
      const techniques = analyzePractitionerTechniques(finalTranscript);
      const generatedNotes = result.isFinal
        ? generateNotes(current.session, finalTranscript, finalHighlights, topics, assessment)
        : current.generatedNotes;
      const next = mergeRecordUpdates(current, {
        transcript,
        speakers,
        highlights: finalHighlights,
        topics,
        assessment,
        techniques,
        generatedNotes
      });
      upsertRecord(next);
      return next;
    });
  }

  function confirmSpeakers() {
    if (!record) return;
    const speakers = normalizeSpeakerNames(
      record.speakers.map((speaker) => ({ ...speaker, confirmedByUser: true })),
      record.session.clientAlias
    );
    save(applySpeakerMappings(record, speakers));
  }

  function swapSpeakers() {
    if (!record) return;
    const speakers: SpeakerMapping[] = record.speakers.map((speaker) => {
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
    save(applySpeakerMappings(record, speakers));
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
    save(applySpeakerMappings(record, speakers));
  }

  function renameSpeaker(label: string, displayName: string) {
    if (!record) return;
    const speakers = record.speakers.map((speaker) =>
      speaker.originalSpeakerLabel === label ? { ...speaker, displayName, confirmedByUser: true } : speaker
    );
    save(applySpeakerMappings(record, speakers));
  }

  async function clearCapture() {
    if (!record) return;
    await clearAudioChunks(record.session.id);
    save({
      ...record,
      transcript: [],
      speakers: [],
      highlights: [],
      topics: [],
      techniques: [],
      assessment: emptyAssessment(),
      generatedNotes: undefined,
      editedNotes: undefined,
      audioChunks: [],
      session: {
        ...record.session,
        status: "Draft",
        endedAt: undefined,
        updatedAt: new Date().toISOString()
      }
    });
  }

  function endSession() {
    if (!record) return;
    const transcript = record.transcript.map((segment) => ({ ...segment, isFinal: true }));
    const speakers = record.speakers.length ? record.speakers : classifySpeakers(transcript);
    const mapped = applySpeakerMappings({ ...record, transcript }, speakers);
    const topics = summarizeTopics(record.session.id, mapped.transcript);
    const assessment = extractAssessment(mapped.transcript);
    const techniques = analyzePractitionerTechniques(mapped.transcript);
    const session = {
      ...mapped.session,
      status: "Ready for Review" as const,
      endedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const generatedNotes = generateNotes(session, mapped.transcript, mapped.highlights, topics, assessment);
    const next = mergeRecordUpdates(mapped, { session, topics, assessment, techniques, generatedNotes });
    save(next);
    router.push(`/sessions/${record.session.id}/review`);
  }

  if (!record) return null;

  return (
    <div className="mx-auto max-w-[1700px] px-5 py-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <Link href="/dashboard" className="mb-2 inline-flex items-center gap-2 text-sm text-moss">
            <ArrowLeft size={15} aria-hidden />
            Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-ink">{record.session.clientAlias || "Live Session"}</h1>
          <p className="mt-1 text-sm text-ink/65">
            {record.session.sessionType} - {record.session.noteFormat} - {record.session.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={clearCapture}>
            <RotateCcw size={16} aria-hidden />
            Clear Capture
          </Button>
          <Link href={`/sessions/${record.session.id}/review`}>
            <Button variant="secondary">
              <FileText size={16} aria-hidden />
              Review
            </Button>
          </Link>
        </div>
      </div>

      <Notice tone="warning">
        Live transcript, highlights, and suggestions are provisional and may be incomplete or incorrect. This tool does
        not replace practitioner judgment, risk assessment, or mandated-reporting review.
      </Notice>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_1fr_0.85fr]">
        <section className="app-panel rounded-lg p-5">
          <h2 className="mb-4 text-lg font-semibold">Recording and Transcript</h2>
          <AudioRecorder
            onChunk={onChunk}
            onSpeechResult={onSpeechResult}
            onEnd={endSession}
            onStateChange={onStateChange}
          />
          <div className="mt-5">
            <LiveTranscript
              segments={record.transcript}
              speakers={record.speakers}
              activeTime={activeTime}
              onSelect={(segment: TranscriptSegment) => setActiveTime(segment.startTime)}
              compact
            />
          </div>
        </section>

        <section className="space-y-5">
          <div className="app-panel rounded-lg p-5">
            <h2 className="mb-4 text-lg font-semibold">Highlights</h2>
            <HighlightPanel highlights={record.highlights} onJump={setActiveTime} />
          </div>
          <div className="app-panel rounded-lg p-5">
            <h2 className="mb-4 text-lg font-semibold">Topic Sentiment</h2>
            <TopicSentimentPanel topics={record.topics} />
          </div>
          <div className="app-panel rounded-lg p-5">
            <h2 className="mb-4 text-lg font-semibold">Rolling Analysis</h2>
            <RollingAnalysisPanel
              assessment={record.assessment}
              techniques={record.techniques}
              note={record.generatedNotes}
            />
          </div>
        </section>

        <aside className="app-panel rounded-lg p-5">
          <SpeakerRoleCard
            speakers={record.speakers}
            onConfirm={confirmSpeakers}
            onSwap={swapSpeakers}
            onEdit={editSpeaker}
            onRename={renameSpeaker}
          />
        </aside>
      </div>
    </div>
  );
}

function applySpeakerMappings(record: SessionRecord, speakers: SpeakerMapping[]): SessionRecord {
  const namedSpeakers = normalizeSpeakerNames(speakers, record.session.clientAlias);
  const transcript = record.transcript.map((segment) => {
    const mapping = namedSpeakers.find((speaker) => speaker.originalSpeakerLabel === segment.speakerLabel);
    return mapping ? { ...segment, speakerRole: mapping.assignedRole } : segment;
  });
  return mergeRecordUpdates(record, { speakers: namedSpeakers, transcript });
}

function ensureRealSpeechSpeaker(speakers: SpeakerMapping[]): SpeakerMapping[] {
  if (speakers.some((speaker) => speaker.originalSpeakerLabel === "Speaker 0")) return speakers;
  return [
    ...speakers,
    {
      originalSpeakerLabel: "Speaker 0",
      assignedRole: "Unassigned",
      displayName: "Captured speaker",
      confidence: 0,
      evidence: ["Real browser speech recognition captured transcript text, but this path does not diarize speakers."],
      confirmedByUser: false
    }
  ];
}

function addHighlight(
  highlights: SessionRecord["highlights"],
  highlight: SessionRecord["highlights"][number] | null
): SessionRecord["highlights"] {
  if (!highlight) return highlights;
  if (highlights.some((candidate) => candidate.evidenceText === highlight.evidenceText)) return highlights;
  return [...highlights, highlight];
}

function estimateSpeechDuration(text: string): number {
  return Math.max(2, Math.ceil(text.split(/\s+/).length / 2.4));
}

function emptyAssessment(): AssessmentBundle {
  return {
    clientNeeds: [],
    barriers: [],
    strengths: [],
    goals: [],
    resourceNeeds: [],
    safetyLikeStatements: [],
    mandatedReportingLikeStatements: [],
    followUpTasks: []
  };
}

function normalizeRecordSpeakerNames(record: SessionRecord): SessionRecord {
  if (record.speakers.length === 0) return record;
  const speakers = normalizeSpeakerNames(record.speakers, record.session.clientAlias);
  if (JSON.stringify(speakers) === JSON.stringify(record.speakers)) return record;
  return applySpeakerMappings(record, speakers);
}

function normalizeSpeakerNames(speakers: SpeakerMapping[], clientAlias: string): SpeakerMapping[] {
  return speakers.map((speaker) => {
    const shouldAutoName =
      !speaker.displayName ||
      speaker.displayName === speaker.assignedRole ||
      speaker.displayName === "Unassigned" ||
      speaker.displayName === speaker.originalSpeakerLabel;
    return shouldAutoName
      ? {
          ...speaker,
          displayName: defaultSpeakerName(speaker.assignedRole, clientAlias, speaker.originalSpeakerLabel)
        }
      : speaker;
  });
}

function defaultSpeakerName(role: SpeakerRole, clientAlias: string, fallback: string): string {
  if (role === "Client") return clientAlias.trim() || "Client";
  if (role === "Practitioner") return "Practitioner";
  return fallback === "Speaker 0" ? "Captured speaker" : fallback;
}
