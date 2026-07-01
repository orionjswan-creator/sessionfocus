import { Session, SessionRecord } from "./types";
import { humanDate } from "./time";
import { noteToPlainText } from "./formatting";

export function downloadJson(record: SessionRecord): void {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${record.session.clientAlias || "session"}-${record.session.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyNote(record: SessionRecord): Promise<void> {
  const note = record.editedNotes ?? record.generatedNotes;
  if (!note) return;
  await navigator.clipboard.writeText(noteToPlainText(note));
}

export function openPdfPrintView(record: SessionRecord): void {
  const note = record.editedNotes ?? record.generatedNotes;
  if (!note) return;
  const win = window.open("", "_blank");
  if (!win) return;
  const escaped = escapeHtml(noteToPlainText(note)).replace(/\n/g, "<br />");
  win.document.write(`
    <html>
      <head>
        <title>SessionFocus Note</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #17201c; line-height: 1.5; }
          h1 { font-size: 22px; margin-bottom: 8px; }
          .meta { color: #46534d; margin-bottom: 22px; }
          .box { border: 1px solid #cfd8d2; padding: 16px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>SessionFocus Documentation Draft</h1>
        <div class="meta">${sessionMeta(record.session)}</div>
        <div class="box">${escaped}</div>
        <p>Practitioner confirmation: __________________________</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <script>window.print();</script>
      </body>
    </html>
  `);
  win.document.close();
}

function sessionMeta(session: Session): string {
  return [
    `Client alias: ${escapeHtml(session.clientAlias || "Not specified")}`,
    `Session date: ${humanDate(session.sessionDate)}`,
    `Session type: ${escapeHtml(session.sessionType)}`,
    `Note format: ${escapeHtml(session.noteFormat)}`,
    session.endedAt ? `Reviewed/finalized timestamp: ${escapeHtml(session.endedAt)}` : ""
  ]
    .filter(Boolean)
    .join("<br />");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[char];
  });
}
