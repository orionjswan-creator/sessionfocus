import { createRecord, deleteRecord, getRecord, loadRecords, upsertRecord } from "./storage";
import { Session, SessionRecord } from "./types";

export const localApi = {
  listSessions(): Session[] {
    return loadRecords().map((record) => record.session);
  },
  getSessionRecord(sessionId: string): SessionRecord | undefined {
    return getRecord(sessionId);
  },
  createSession(session: Session): SessionRecord {
    return createRecord(session);
  },
  saveRecord(record: SessionRecord): void {
    upsertRecord(record);
  },
  deleteSession(sessionId: string): void {
    deleteRecord(sessionId);
  }
};
