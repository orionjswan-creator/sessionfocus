export type SessionStatus =
  | "Draft"
  | "Recording"
  | "Processing"
  | "Awaiting Speaker Confirmation"
  | "Ready for Review"
  | "Finalized"
  | "Exported";

export type SessionType =
  | "Counseling"
  | "Case management"
  | "Intake"
  | "Social work follow-up"
  | "Coaching"
  | "Resource navigation"
  | "Other";

export type NoteFormat =
  | "DAP"
  | "General Case Note"
  | "Psychosocial Summary"
  | "Resource / Referral Plan"
  | "Follow-Up Task List"
  | "SOAP"
  | "BIRP"
  | "GIRP";

export type SpeakerRole = "Client" | "Practitioner" | "Unassigned";

export type Session = {
  id: string;
  clientAlias: string;
  sessionDate: string;
  sessionType: SessionType;
  noteFormat: NoteFormat;
  status: SessionStatus;
  consentConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
};

export type TranscriptSegment = {
  id: string;
  sessionId: string;
  temporarySegmentId?: string;
  speakerLabel: string;
  speakerRole: SpeakerRole;
  startTime: number;
  endTime: number;
  text: string;
  editedText?: string;
  confidence: number;
  isFinal: boolean;
  createdAt: string;
};

export type SpeakerMapping = {
  originalSpeakerLabel: string;
  assignedRole: SpeakerRole;
  displayName: string;
  confidence: number;
  evidence: string[];
  confirmedByUser: boolean;
};

export type Highlight = {
  id: string;
  sessionId: string;
  startTime: number;
  endTime: number;
  highlightType: string;
  severity: "Low" | "Medium" | "High";
  title: string;
  evidenceText: string;
  topic: string;
  sentimentLabel: "positive" | "negative" | "mixed" | "neutral" | "unclear";
  emotionLabel: string;
  suggestedFocus: string;
  suggestedTechnique: string;
  suggestedLanguage: string;
  isLive: boolean;
  isConfirmed: boolean;
  createdAt: string;
};

export type TopicSentimentSummary = {
  id: string;
  sessionId: string;
  topic: string;
  sentimentLabel: "positive" | "negative" | "mixed" | "neutral" | "unclear";
  emotionLabels: string[];
  intensity: "low" | "medium" | "high" | "unclear";
  summary: string;
  evidenceQuotes: string[];
  recommendedFollowUp: string;
  suggestedTechnique: string;
};

export type PractitionerTechniqueObservation = {
  id: string;
  startTime: number;
  endTime: number;
  techniqueType: string;
  observation: string;
  evidenceText: string;
  suggestedAlternative: string;
};

export type AssessmentBundle = {
  clientNeeds: string[];
  barriers: string[];
  strengths: string[];
  goals: string[];
  resourceNeeds: string[];
  safetyLikeStatements: string[];
  mandatedReportingLikeStatements: string[];
  followUpTasks: string[];
};

export type NoteBundle = {
  keyNotes: {
    presentingConcern: string;
    mainThemes: string[];
    clientNeeds: string[];
    barriers: string[];
    strengths: string[];
    protectiveFactors: string[];
    goals: string[];
    resourcesDiscussed: string[];
    homeworkOrPractice: string[];
    followUpTasks: string[];
    itemsForPractitionerConfirmation: string[];
  };
  generalCaseNote: {
    summary: string;
    clientReported: string[];
    practitionerActions: string[];
    clientResponse: string[];
    plan: string[];
  };
  dapNote: {
    data: string;
    assessment: string;
    plan: string;
  };
  psychosocialSummary: {
    presentingNeeds: string;
    emotionalContext: string;
    socialContext: string;
    basicNeeds: string;
    barriers: string;
    strengths: string;
    supports: string;
    followUpNeeds: string;
  };
  resourceReferralPlan: {
    resourceNeeds: string[];
    resourcesDiscussed: string[];
    referralsDiscussed: string[];
    consentOrReleaseItems: string[];
    nextSteps: string[];
  };
  followUpTaskList: string[];
  topicSentimentSummary: TopicSentimentSummary[];
  optionalBehavioralObservation: Record<string, string>;
  highlightedMoments: Highlight[];
  finalizedAt?: string;
};

export type SessionRecord = {
  session: Session;
  transcript: TranscriptSegment[];
  speakers: SpeakerMapping[];
  highlights: Highlight[];
  topics: TopicSentimentSummary[];
  techniques: PractitionerTechniqueObservation[];
  assessment: AssessmentBundle;
  generatedNotes?: NoteBundle;
  editedNotes?: NoteBundle;
  audioChunks: { id: string; index: number; createdAt: string; size: number }[];
};

export type LiveEvent =
  | { type: "transcript_partial"; segment: TranscriptSegment }
  | { type: "transcript_final"; segment: TranscriptSegment }
  | { type: "speaker_roles_updated"; speakers: SpeakerMapping[] }
  | { type: "highlight_created"; highlight: Highlight }
  | { type: "topic_sentiment_updated"; topics: TopicSentimentSummary[] };
