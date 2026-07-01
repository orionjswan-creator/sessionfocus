export type AudioChunkInput = {
  sessionId: string;
  chunkIndex: number;
  audio: ArrayBuffer;
  startTime?: number;
  endTime?: number;
};

export type TranscriptSegment = {
  id: string;
  sessionId: string;
  speakerLabel: string;
  speakerRole?: "Client" | "Practitioner" | "Unassigned";
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  isFinal: boolean;
};

export interface LiveTranscriptionProvider {
  transcribeChunk(input: AudioChunkInput): Promise<TranscriptSegment[]>;
}

export interface FinalTranscriptionProvider {
  transcribeFinal(input: { sessionId: string; audio: ArrayBuffer }): Promise<TranscriptSegment[]>;
}
