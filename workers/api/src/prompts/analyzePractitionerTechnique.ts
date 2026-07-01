export const analyzePractitionerTechniquePrompt = `Analyze the practitioner/helper responses in the transcript.

Rules:
- This is for practitioner self-review, not criticism.
- Identify techniques used by the practitioner.
- Identify possible missed cues only when there is clear transcript evidence.
- Do not judge competence.
- Use neutral language.
- Do not provide diagnosis, treatment decisions, risk scoring, or mandated-reporting decisions.

Return JSON only.`;
