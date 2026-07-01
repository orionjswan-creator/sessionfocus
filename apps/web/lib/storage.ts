import {
  AssessmentBundle,
  Highlight,
  NoteBundle,
  PractitionerTechniqueObservation,
  Session,
  SessionRecord,
  SpeakerMapping,
  TopicSentimentSummary,
  TranscriptSegment
} from "./types";

const storageKey = "sessionfocus.records.v1";

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

export function loadRecords(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export function saveRecords(records: SessionRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(records));
}

export function getRecord(sessionId: string): SessionRecord | undefined {
  return loadRecords().find((record) => record.session.id === sessionId);
}

export function upsertRecord(record: SessionRecord): void {
  const records = loadRecords();
  const index = records.findIndex((candidate) => candidate.session.id === record.session.id);
  const next = index === -1 ? [record, ...records] : records.map((candidate, i) => (i === index ? record : candidate));
  saveRecords(next);
}

export function createRecord(session: Session): SessionRecord {
  const record: SessionRecord = {
    session,
    transcript: [],
    speakers: [],
    highlights: [],
    topics: [],
    techniques: [],
    assessment: emptyAssessment(),
    audioChunks: []
  };
  upsertRecord(record);
  return record;
}

export function deleteRecord(sessionId: string): void {
  saveRecords(loadRecords().filter((record) => record.session.id !== sessionId));
}

export function mergeRecordUpdates(
  record: SessionRecord,
  updates: Partial<{
    session: Session;
    transcript: TranscriptSegment[];
    speakers: SpeakerMapping[];
    highlights: Highlight[];
    topics: TopicSentimentSummary[];
    techniques: PractitionerTechniqueObservation[];
    assessment: AssessmentBundle;
    generatedNotes: NoteBundle;
    editedNotes: NoteBundle;
  }>
): SessionRecord {
  return {
    ...record,
    ...updates,
    session: updates.session ?? record.session,
    transcript: updates.transcript ?? record.transcript,
    speakers: updates.speakers ?? record.speakers,
    highlights: updates.highlights ?? record.highlights,
    topics: updates.topics ?? record.topics,
    techniques: updates.techniques ?? record.techniques,
    assessment: updates.assessment ?? record.assessment
  };
}
