import { NoteBundle } from "./types";

export function stringifyList(items: string[]): string {
  return items.length ? items.join("\n") : "not discussed";
}

export function noteToPlainText(note: NoteBundle): string {
  return [
    "AI-generated draft. Practitioner must review, edit, and confirm before use.",
    "",
    "Key Notes",
    note.keyNotes.presentingConcern,
    stringifyList(note.keyNotes.mainThemes),
    "",
    "General Case Note",
    note.generalCaseNote.summary,
    stringifyList(note.generalCaseNote.clientReported),
    "",
    "DAP Note",
    `Data: ${note.dapNote.data}`,
    `Assessment: ${note.dapNote.assessment}`,
    `Plan: ${note.dapNote.plan}`,
    "",
    "Psychosocial Summary",
    note.psychosocialSummary.presentingNeeds,
    note.psychosocialSummary.emotionalContext,
    "",
    "Resource / Referral Plan",
    stringifyList(note.resourceReferralPlan.nextSteps),
    "",
    "Follow-Up Tasks",
    stringifyList(note.followUpTaskList),
    "",
    "Safety and Resource Review",
    "Risk-like, safety-related, or mandated-reporting-related statements are flagged for practitioner review only. Absence of a flagged statement does not mean absence of risk or safety concern.",
    "Resource and referral suggestions are documentation aids only. Practitioner must verify eligibility, availability, consent, and local requirements before referral."
  ].join("\n");
}
