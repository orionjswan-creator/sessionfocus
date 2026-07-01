import { AudioChunkInput, LiveTranscriptionProvider, TranscriptSegment } from "./TranscriptionProvider";

const lines = [
  "Before we get into the week, what feels most important to focus on today?",
  "I feel like I keep trying and nothing changes. Work is piling up and I am behind on rent.",
  "That sounds exhausting. What feels most stuck right now?",
  "I missed the bus twice this week, so getting to appointments has been hard."
];

export class MockLiveTranscriptionProvider implements LiveTranscriptionProvider {
  async transcribeChunk(input: AudioChunkInput): Promise<TranscriptSegment[]> {
    const text = lines[input.chunkIndex % lines.length];
    return [
      {
        id: crypto.randomUUID(),
        sessionId: input.sessionId,
        speakerLabel: input.chunkIndex % 2 === 0 ? "Speaker 0" : "Speaker 1",
        startTime: input.startTime ?? input.chunkIndex * 12,
        endTime: input.endTime ?? input.chunkIndex * 12 + 8,
        text,
        confidence: 0.9,
        isFinal: false
      }
    ];
  }
}
