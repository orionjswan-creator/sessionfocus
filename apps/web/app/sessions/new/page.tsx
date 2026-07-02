"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Calendar, CheckCircle2, FileText, UserRound } from "lucide-react";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { createRecord } from "@/lib/storage";
import { todayInputValue } from "@/lib/time";
import { NoteFormat, Session, SessionType } from "@/lib/types";
import { makeId } from "@/lib/analysis";

const sessionTypes: SessionType[] = [
  "Counseling",
  "Case management",
  "Intake",
  "Social work follow-up",
  "Coaching",
  "Resource navigation",
  "Other"
];

const noteFormats: NoteFormat[] = [
  "DAP",
  "General Case Note",
  "Psychosocial Summary",
  "Resource / Referral Plan",
  "Follow-Up Task List",
  "SOAP",
  "BIRP",
  "GIRP"
];

export default function NewSessionPage() {
  const router = useRouter();
  const [clientAlias, setClientAlias] = useState("");
  const [sessionDate, setSessionDate] = useState(todayInputValue());
  const [sessionType, setSessionType] = useState<SessionType>("Counseling");
  const [noteFormat, setNoteFormat] = useState<NoteFormat>("DAP");
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!consentConfirmed) return;
    const now = new Date().toISOString();
    const session: Session = {
      id: makeId("session"),
      clientAlias,
      sessionDate,
      sessionType,
      noteFormat,
      status: "Draft",
      consentConfirmed,
      createdAt: now,
      updatedAt: now
    };
    createRecord(session);
    router.push(`/sessions/${session.id}/live`);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-ink">New Session</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          Start with consent and minimal identifying detail. Client alias is optional for privacy-preserving sessions.
        </p>
      </div>

      <form onSubmit={submit} className="app-panel space-y-6 rounded-lg p-6">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
            <UserRound size={16} aria-hidden />
            Client alias
          </span>
          <input
            className="w-full rounded-md border border-moss/25 bg-white px-3 py-2"
            value={clientAlias}
            onChange={(event) => setClientAlias(event.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
            <Calendar size={16} aria-hidden />
            Session date
          </span>
          <input
            className="w-full rounded-md border border-moss/25 bg-white px-3 py-2"
            type="date"
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Session type</span>
            <select
              className="w-full rounded-md border border-moss/25 bg-white px-3 py-2"
              value={sessionType}
              onChange={(event) => setSessionType(event.target.value as SessionType)}
            >
              {sessionTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              <FileText size={16} aria-hidden />
              Note format
            </span>
            <select
              className="w-full rounded-md border border-moss/25 bg-white px-3 py-2"
              value={noteFormat}
              onChange={(event) => setNoteFormat(event.target.value as NoteFormat)}
            >
              {noteFormats.map((format) => (
                <option key={format}>{format}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-md border border-sun/35 bg-sun/10 p-4">
          <input
            className="mt-1 h-4 w-4"
            type="checkbox"
            checked={consentConfirmed}
            onChange={(event) => setConsentConfirmed(event.target.checked)}
          />
          <span className="text-sm leading-6">
            I confirm that recording and AI-assisted documentation use are permitted for this session, including any
            consent required by applicable law, policy, and professional rules.
          </span>
        </label>

        <Notice>
          Use a client alias instead of identifying details when possible. Resource and referral suggestions are
          documentation aids only. Practitioner must verify eligibility, availability, consent, and local requirements
          before referral.
        </Notice>

        <Button type="submit" disabled={!consentConfirmed} className="w-full md:w-auto">
          <CheckCircle2 size={17} aria-hidden />
          Create Session
        </Button>
      </form>
    </div>
  );
}
