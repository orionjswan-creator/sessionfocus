import { TranscriptSegment } from "../transcription/TranscriptionProvider";

export type SpeakerRoleResult = {
  originalSpeakerLabel: string;
  assignedRole: "Client" | "Practitioner" | "Unassigned";
  confidence: number;
  evidence: string[];
};

export class SpeakerRoleClassifier {
  classify(segments: TranscriptSegment[]): SpeakerRoleResult[] {
    const labels = Array.from(new Set(segments.map((segment) => segment.speakerLabel)));
    return labels.map((label) => {
      const combined = segments
        .filter((segment) => segment.speakerLabel === label)
        .map((segment) => segment.text.toLowerCase())
        .join(" ");
      const isPractitioner = combined.includes("?") || combined.includes("sounds");
      return {
        originalSpeakerLabel: label,
        assignedRole: isPractitioner ? "Practitioner" : "Client",
        confidence: isPractitioner ? 0.91 : 0.86,
        evidence: isPractitioner
          ? ["Asked questions or used reflective language."]
          : ["Reported needs, stressors, emotions, or preferences."]
      };
    });
  }
}
