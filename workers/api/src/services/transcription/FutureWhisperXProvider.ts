import { FinalTranscriptionProvider, TranscriptSegment } from "./TranscriptionProvider";

export class FutureWhisperXProvider implements FinalTranscriptionProvider {
  async transcribeFinal(input: { sessionId: string; audio: ArrayBuffer }): Promise<TranscriptSegment[]> {
    void input;
    throw new Error("WhisperX final-pass placeholder. Wire m-bain/whisperX here.");
  }
}
