import { TranscriptSegment } from "../transcription/TranscriptionProvider";

export class TopicSentimentService {
  analyze(segments: TranscriptSegment[]) {
    const text = segments.map((segment) => segment.text).join(" ");
    return {
      topics: [
        text.match(/rent|housing/i) ? "Housing stability" : "",
        text.match(/bus|transportation/i) ? "Transportation access" : "",
        text.match(/overwhelmed|nothing changes/i) ? "Overwhelm and discouragement" : ""
      ].filter(Boolean)
    };
  }
}
