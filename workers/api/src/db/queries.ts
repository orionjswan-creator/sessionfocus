export const queries = {
  listSessions: "SELECT * FROM sessions ORDER BY updated_at DESC",
  getSession: "SELECT * FROM sessions WHERE id = ?",
  insertSession:
    "INSERT INTO sessions (id, user_id, client_alias, session_date, session_type, note_format, consent_confirmed) VALUES (?, ?, ?, ?, ?, ?, ?)",
  updateSessionStatus: "UPDATE sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  deleteSession: "DELETE FROM sessions WHERE id = ?"
};
