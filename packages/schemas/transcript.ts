export type TranscriptSegmentSchema = {
  id: string;
  sessionId: string;
  temporarySegmentId?: string;
  speakerLabel: string;
  speakerRole?: "Client" | "Practitioner" | "Unassigned";
  startTime: number;
  endTime: number;
  text: string;
  editedText?: string;
  confidence: number;
  isFinal: boolean;
};
