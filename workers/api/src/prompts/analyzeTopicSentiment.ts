export const analyzeTopicSentimentPrompt = `Analyze the transcript for topic-level sentiment, emotional themes, client needs, and areas where the practitioner may want to focus follow-up.

Rules:
- Do not diagnose.
- Do not infer clinical disorders.
- Do not make eligibility, safety, or mandated-reporting determinations.
- Use only transcript evidence.
- Analyze the client's statements separately from the practitioner's statements.
- Include timestamps and direct evidence.

Return JSON only.`;
