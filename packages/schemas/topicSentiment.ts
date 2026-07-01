export type TopicSentimentSchema = {
  topic: string;
  sentimentLabel: "positive" | "negative" | "mixed" | "neutral" | "unclear";
  emotionLabels: string[];
  intensity: "low" | "medium" | "high" | "unclear";
  summary: string;
  evidenceQuotes: string[];
  recommendedFollowUp: string;
  suggestedTechnique: string;
};
