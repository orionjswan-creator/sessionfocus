import { AssessmentBundle, NoteBundle, PractitionerTechniqueObservation } from "@/lib/types";

export function RollingAnalysisPanel({
  assessment,
  note,
  techniques
}: {
  assessment: AssessmentBundle;
  note?: NoteBundle;
  techniques: PractitionerTechniqueObservation[];
}) {
  return (
    <div className="space-y-3">
      <Section title="Needs" items={assessment.clientNeeds} empty="No client needs extracted yet." />
      <Section title="Barriers" items={assessment.barriers} empty="No barriers extracted yet." />
      <Section title="Strengths / Change Language" items={assessment.strengths} empty="No strengths extracted yet." />
      <Section title="Goals" items={assessment.goals} empty="No goals extracted yet." />
      <Section title="Follow-Up Tasks" items={assessment.followUpTasks} empty="No follow-up tasks extracted yet." />
      <Section
        title="Review Flags"
        items={[...assessment.safetyLikeStatements, ...assessment.mandatedReportingLikeStatements]}
        empty="No safety-like or mandated-reporting-like statements flagged yet."
      />
      <Section
        title="Practitioner Technique"
        items={techniques.map((technique) => `${technique.techniqueType}: ${technique.observation}`)}
        empty="No practitioner technique observations yet."
      />
      <div className="rounded-md border border-moss/15 bg-white p-3">
        <h3 className="text-sm font-semibold">Provisional Draft</h3>
        <p className="mt-2 text-sm leading-6 text-ink/75">
          {note?.generalCaseNote.summary ?? "A draft summary will appear after transcript evidence is captured."}
        </p>
      </div>
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-md border border-moss/15 bg-white p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-2 space-y-1 text-sm leading-6 text-ink/75">
          {items.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink/55">{empty}</p>
      )}
    </div>
  );
}
