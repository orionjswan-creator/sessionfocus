import { TopicSentimentSummary } from "@/lib/types";

export function TopicSentimentPanel({ topics }: { topics: TopicSentimentSummary[] }) {
  return (
    <div className="space-y-3">
      {topics.length === 0 ? (
        <p className="rounded-md border border-dashed border-moss/25 p-5 text-sm text-ink/60">
          Topic-level sentiment will update as transcript evidence accumulates.
        </p>
      ) : (
        topics.map((topic) => (
          <div key={topic.id} className="rounded-md border border-moss/15 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{topic.topic}</h3>
                <p className="mt-1 text-xs uppercase text-ink/50">{topic.intensity} intensity</p>
              </div>
              <span className="rounded bg-clay/10 px-2 py-1 text-xs font-medium text-clay">{topic.sentimentLabel}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/75">{topic.summary}</p>
            {topic.emotionLabels.length ? (
              <p className="mt-2 text-xs text-ink/60">Emotions: {topic.emotionLabels.join(", ")}</p>
            ) : null}
            {topic.evidenceQuotes.length ? (
              <details className="mt-3 text-sm text-ink/70">
                <summary className="cursor-pointer text-xs font-semibold uppercase text-ink/50">Evidence</summary>
                <ul className="mt-2 space-y-1">
                  {topic.evidenceQuotes.slice(0, 3).map((quote) => (
                    <li key={quote}>"{quote}"</li>
                  ))}
                </ul>
              </details>
            ) : null}
            <p className="mt-3 text-xs font-semibold uppercase text-ink/50">Recommended follow-up</p>
            <p className="mt-1 text-sm text-ink/75">{topic.recommendedFollowUp}</p>
          </div>
        ))
      )}
    </div>
  );
}
