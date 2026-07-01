import { AudioChunkInput, LiveTranscriptionProvider, TranscriptSegment } from "./TranscriptionProvider";

export class FutureFasterWhisperProvider implements LiveTranscriptionProvider {
  async transcribeChunk(input: AudioChunkInput): Promise<TranscriptSegment[]> {
    void input;
    throw new Error("faster-whisper provider placeholder. Wire SYSTRAN/faster-whisper here.");
  }
}
