"use client";

import { SpeakerMapping, TranscriptSegment } from "@/lib/types";
import { formatTimestamp } from "@/lib/time";

export function LiveTranscript({
  segments,
  speakers = [],
  activeTime,
  onSelect,
  compact = false
}: {
  segments: TranscriptSegment[];
  speakers?: SpeakerMapping[];
  activeTime?: number;
  onSelect?: (segment: TranscriptSegment) => void;
  compact?: boolean;
}) {
  return (
    <div className={`muted-scrollbar overflow-y-auto pr-2 ${compact ? "max-h-[440px] space-y-2" : "max-h-[520px] space-y-3"}`}>
      {segments.length === 0 ? (
        <p className="rounded-md border border-dashed border-moss/25 p-5 text-sm text-ink/60">
          Transcript segments will appear here as live chunks are processed.
        </p>
      ) : (
        segments.map((segment) => {
          const isActive =
            activeTime !== undefined && activeTime >= segment.startTime && activeTime <= segment.endTime + 4;
          return (
            <button
              key={segment.id}
              onClick={() => onSelect?.(segment)}
              className={`block w-full rounded-md border text-left transition ${
                isActive ? "border-sun bg-sun/10" : "border-moss/15 bg-white hover:bg-linen"
              } ${compact ? "p-2.5" : "p-3"}`}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-ink/60">
                <span className="font-mono">[{formatTimestamp(segment.startTime)}]</span>
                <span className="rounded bg-moss/10 px-2 py-0.5 font-medium text-moss">
                  {speakerName(segment, speakers)}
                </span>
                <span>{segment.isFinal ? "Final" : "Live"}</span>
                {!compact ? <span>{Math.round(segment.confidence * 100)}%</span> : null}
              </div>
              <p className={`${compact ? "text-sm leading-5" : "text-sm leading-6"} text-ink`}>
                {segment.editedText ?? segment.text}
              </p>
            </button>
          );
        })
      )}
    </div>
  );
}

function speakerName(segment: TranscriptSegment, speakers: SpeakerMapping[]): string {
  const speaker = speakers.find((candidate) => candidate.originalSpeakerLabel === segment.speakerLabel);
  if (speaker?.displayName) return speaker.displayName;
  if (segment.speakerRole && segment.speakerRole !== "Unassigned") return segment.speakerRole;
  return segment.speakerLabel;
}
