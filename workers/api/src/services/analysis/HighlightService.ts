import { TranscriptSegment } from "../transcription/TranscriptionProvider";

export class HighlightService {
  detect(segment: TranscriptSegment) {
    const text = segment.text.toLowerCase();
    if (text.includes("nothing changes") || text.includes("overwhelmed")) {
      return {
        type: "High attention",
        severity: "High",
        title: "Distress / discouragement",
        evidence: segment.text
      };
    }
    if (text.includes("rent") || text.includes("bus")) {
      return {
        type: "Practical barrier",
        severity: "Medium",
        title: "Resource or access barrier",
        evidence: segment.text
      };
    }
    return null;
  }
}
