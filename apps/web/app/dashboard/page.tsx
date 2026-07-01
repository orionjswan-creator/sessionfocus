"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FileDown, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { deleteRecord, loadRecords } from "@/lib/storage";
import { humanDate } from "@/lib/time";
import { SessionRecord } from "@/lib/types";

export default function DashboardPage() {
  const [records, setRecords] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const sorted = useMemo(
    () =>
      [...records].sort(
        (a, b) => new Date(b.session.updatedAt).getTime() - new Date(a.session.updatedAt).getTime()
      ),
    [records]
  );

  function remove(sessionId: string) {
    deleteRecord(sessionId);
    setRecords(loadRecords());
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">Sessions</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">
            Capture live conversations, review provisional assistance, and finalize documentation only after
            practitioner review.
          </p>
        </div>
        <Link href="/sessions/new">
          <Button>
            <Plus size={17} aria-hidden />
            New Session
          </Button>
        </Link>
      </div>

      <Notice tone="warning">
        SessionFocus is a documentation assistant. It does not diagnose, assess risk level, make mandated-reporting
        decisions, or replace professional judgment.
      </Notice>

      <section className="app-panel mt-6 overflow-hidden rounded-lg">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1.3fr] gap-4 border-b border-moss/15 bg-moss/10 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink/65 max-lg:hidden">
          <span>Client alias</span>
          <span>Session date</span>
          <span>Status</span>
          <span>Note type</span>
          <span>Last updated</span>
          <span>Actions</span>
        </div>
        {sorted.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-lg font-medium">No sessions yet.</p>
            <p className="mt-2 text-sm text-ink/65">Create a session to begin the live documentation workflow.</p>
          </div>
        ) : (
          <div className="divide-y divide-moss/10">
            {sorted.map((record) => (
              <div
                key={record.session.id}
                className="grid gap-4 px-5 py-4 text-sm lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1.3fr] lg:items-center"
              >
                <div>
                  <p className="font-semibold text-ink">{record.session.clientAlias || "Client alias not set"}</p>
                  <p className="text-xs text-ink/60">{record.session.sessionType}</p>
                </div>
                <span>{humanDate(record.session.sessionDate)}</span>
                <span className="w-fit rounded-md border border-moss/20 bg-white px-2.5 py-1 text-xs">
                  {record.session.status}
                </span>
                <span>{record.session.noteFormat}</span>
                <span>{new Date(record.session.updatedAt).toLocaleString()}</span>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/sessions/${record.session.id}/live`}>
                    <Button variant="secondary" className="px-3">
                      <FolderOpen size={15} aria-hidden />
                      Open
                    </Button>
                  </Link>
                  <Link href={`/sessions/${record.session.id}/review`}>
                    <Button variant="secondary" className="px-3">
                      <FileDown size={15} aria-hidden />
                      Review
                    </Button>
                  </Link>
                  <Button variant="ghost" className="px-3 text-clay" onClick={() => remove(record.session.id)}>
                    <Trash2 size={15} aria-hidden />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
