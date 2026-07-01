"use client";

import { AlertCircle, MessageCircle } from "lucide-react";
import { Highlight } from "@/lib/types";
import { formatTimestamp } from "@/lib/time";

export function HighlightPanel({
  highlights,
  onJump
}: {
  highlights: Highlight[];
  onJump?: (time: number) => void;
}) {
  return (
    <div className="space-y-3">
      {highlights.length === 0 ? (
        <p className="rounded-md border border-dashed border-moss/25 p-5 text-sm text-ink/60">
          Live highlights will appear when the transcript includes distress language, barriers, or review flags.
        </p>
      ) : (
        highlights.map((highlight) => (
          <button
            key={highlight.id}
            onClick={() => onJump?.(highlight.startTime)}
            className="block w-full rounded-md border border-moss/15 bg-white p-4 text-left shadow-sm transition hover:border-moss/35"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  {highlight.severity === "High" ? (
                    <AlertCircle className="h-4 w-4 text-clay" aria-hidden />
                  ) : (
                    <MessageCircle className="h-4 w-4 text-moss" aria-hidden />
                  )}
                  {highlight.highlightType} - {highlight.title}
                </p>
                <p className="mt-1 text-xs text-ink/60">
                  {formatTimestamp(highlight.startTime)}-{formatTimestamp(highlight.endTime)}
                </p>
              </div>
              <span className="rounded bg-sun/20 px-2 py-1 text-xs font-medium">{highlight.sentimentLabel}</span>
            </div>
            <p className="text-xs font-semibold uppercase text-ink/50">Evidence</p>
            <p className="mt-1 text-sm leading-6">"{highlight.evidenceText}"</p>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="font-medium">Topic</dt>
                <dd className="text-ink/70">{highlight.topic}</dd>
              </div>
              <div>
                <dt className="font-medium">Suggested focus</dt>
                <dd className="text-ink/70">{highlight.suggestedFocus}</dd>
              </div>
              <div>
                <dt className="font-medium">Suggested technique</dt>
                <dd className="text-ink/70">{highlight.suggestedTechnique}</dd>
              </div>
            </dl>
          </button>
        ))
      )}
    </div>
  );
}
