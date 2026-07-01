export class NoteGenerationService {
  generate() {
    return {
      disclaimer: "AI-generated draft. Practitioner must review, edit, and confirm before use.",
      key_notes: {},
      dap_note: {},
      follow_up_task_list: []
    };
  }
}
