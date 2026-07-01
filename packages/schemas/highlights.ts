export type HighlightSchema = {
  id: string;
  sessionId: string;
  startTime: number;
  endTime: number;
  highlightType: string;
  severity: "Low" | "Medium" | "High";
  title: string;
  evidenceText: string;
  topic: string;
  sentimentLabel: string;
  emotionLabel: string;
  suggestedFocus: string;
  suggestedTechnique: string;
  suggestedLanguage: string;
};
