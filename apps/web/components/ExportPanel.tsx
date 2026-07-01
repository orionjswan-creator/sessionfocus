"use client";

import { Clipboard, Download, FileJson } from "lucide-react";
import { Button } from "./Button";
import { Notice } from "./Notice";
import { copyNote, downloadJson, openPdfPrintView } from "@/lib/export";
import { SessionRecord } from "@/lib/types";

export function ExportPanel({ record }: { record: SessionRecord }) {
  const hasNote = Boolean(record.editedNotes ?? record.generatedNotes);
  return (
    <div className="space-y-4">
      <Notice tone="warning">
        Do not include the full raw transcript in exported documentation unless the practitioner explicitly chooses to
        attach it.
      </Notice>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => copyNote(record)} disabled={!hasNote}>
          <Clipboard size={16} aria-hidden />
          Copy Note
        </Button>
        <Button variant="secondary" onClick={() => openPdfPrintView(record)} disabled={!hasNote}>
          <Download size={16} aria-hidden />
          Download PDF
        </Button>
        <Button variant="secondary" onClick={() => downloadJson(record)}>
          <FileJson size={16} aria-hidden />
          Download JSON
        </Button>
      </div>
      <p className="text-xs leading-5 text-ink/60">
        The PDF action opens a print-ready note view. Choose Save as PDF in the print dialog.
      </p>
    </div>
  );
}
