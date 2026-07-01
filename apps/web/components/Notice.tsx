import { AlertTriangle, Info } from "lucide-react";

export function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warning" }) {
  const Icon = tone === "warning" ? AlertTriangle : Info;
  return (
    <div
      className={`flex gap-3 rounded-md border px-4 py-3 text-sm ${
        tone === "warning"
          ? "border-clay/30 bg-clay/10 text-ink"
          : "border-moss/20 bg-moss/10 text-ink"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
