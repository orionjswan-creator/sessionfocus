import { DiarizationProvider, DiarizedTurn } from "./DiarizationProvider";

export class FuturePyannoteProvider implements DiarizationProvider {
  async diarize(input: { sessionId: string; audio: ArrayBuffer }): Promise<DiarizedTurn[]> {
    void input;
    throw new Error("pyannote.audio provider placeholder.");
  }
}
