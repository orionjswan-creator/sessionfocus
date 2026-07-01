import { AudioChunkInput, LiveTranscriptionProvider, TranscriptSegment } from "./TranscriptionProvider";

export class CloudTranscriptionProvider implements LiveTranscriptionProvider {
  async transcribeChunk(input: AudioChunkInput): Promise<TranscriptSegment[]> {
    void input;
    throw new Error("Cloud transcription provider is not configured for this MVP.");
  }
}
