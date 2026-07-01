export class PsychologicalAssessmentService {
  extract() {
    return {
      presenting_concerns: [],
      emotional_themes: [],
      not_assessed: ["Diagnosis", "Risk level"]
    };
  }
}
