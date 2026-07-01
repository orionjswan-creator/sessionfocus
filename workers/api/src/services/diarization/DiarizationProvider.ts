export type DiarizedTurn = {
  speakerLabel: string;
  startTime: number;
  endTime: number;
  confidence: number;
};

export interface DiarizationProvider {
  diarize(input: { sessionId: string; audio: ArrayBuffer }): Promise<DiarizedTurn[]>;
}
