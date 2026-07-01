export type SessionStatus =
  | "Draft"
  | "Recording"
  | "Processing"
  | "Awaiting Speaker Confirmation"
  | "Ready for Review"
  | "Finalized"
  | "Exported";

export type SessionSchema = {
  id: string;
  userId: string;
  clientAlias?: string;
  sessionDate: string;
  sessionType: string;
  noteFormat: string;
  status: SessionStatus;
  consentConfirmed: boolean;
};
