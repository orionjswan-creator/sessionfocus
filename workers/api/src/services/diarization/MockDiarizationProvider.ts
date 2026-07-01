import { DiarizationProvider, DiarizedTurn } from "./DiarizationProvider";

export class MockDiarizationProvider implements DiarizationProvider {
  async diarize(): Promise<DiarizedTurn[]> {
    return [
      { speakerLabel: "Speaker 0", startTime: 0, endTime: 12, confidence: 0.9 },
      { speakerLabel: "Speaker 1", startTime: 12, endTime: 24, confidence: 0.87 }
    ];
  }
}
