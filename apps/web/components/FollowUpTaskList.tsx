"use client";

export function FollowUpTaskList({ tasks, onChange }: { tasks: string[]; onChange?: (tasks: string[]) => void }) {
  if (!onChange) {
    return (
      <ul className="space-y-2 text-sm text-ink/75">
        {tasks.map((task) => (
          <li key={task} className="rounded-md border border-moss/15 bg-white px-3 py-2">
            {task}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <textarea
      className="min-h-40 w-full rounded-md border border-moss/25 bg-white px-3 py-2 text-sm leading-6"
      value={tasks.join("\n")}
      onChange={(event) => onChange(event.target.value.split("\n").filter(Boolean))}
    />
  );
}
