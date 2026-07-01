import { AudioChunkInput, LiveTranscriptionProvider, TranscriptSegment } from "./TranscriptionProvider";

export class FutureWhisperStreamingProvider implements LiveTranscriptionProvider {
  async transcribeChunk(input: AudioChunkInput): Promise<TranscriptSegment[]> {
    void input;
    throw new Error("Whisper-Streaming adapter placeholder. Wire ufal/whisper_streaming here.");
  }
}
