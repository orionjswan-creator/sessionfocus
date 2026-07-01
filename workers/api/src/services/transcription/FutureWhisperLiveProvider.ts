import { AudioChunkInput, LiveTranscriptionProvider, TranscriptSegment } from "./TranscriptionProvider";

export class FutureWhisperLiveProvider implements LiveTranscriptionProvider {
  async transcribeChunk(input: AudioChunkInput): Promise<TranscriptSegment[]> {
    void input;
    throw new Error("WhisperLive adapter placeholder. Wire collabora/WhisperLive here.");
  }
}
