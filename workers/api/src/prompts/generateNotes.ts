export const generateNotesPrompt = `Generate a draft psychological support and social work documentation bundle for practitioner review.

Rules:
- Use neutral documentation language.
- Do not diagnose.
- Do not infer disorders.
- Do not add information not present in the transcript or extracted facts.
- Include only explicitly stated safety-related information.
- Do not make mandated-reporting decisions. Only include flagged content for qualified professional review.
- Do not fabricate referrals or resources.
- If resources were discussed but not named, say "resource not specified."
- Everything is a draft for practitioner review.

Return JSON only.`;
