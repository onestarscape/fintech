import { cn } from "@/lib/utils";

export interface TimelineStep {
  label: string;
  timestamp?: string;
  note?: string;
  state: "done" | "current" | "upcoming";
}

/**
 * The application journey, rendered as connected dots. This is the visual
 * signature of the product: the same motif previews the journey on the
 * marketing site and tracks a real application in the customer dashboard.
 */
export function Timeline({
  steps,
  orientation = "vertical",
}: {
  steps: TimelineStep[];
  orientation?: "vertical" | "horizontal";
}) {
  if (orientation === "horizontal") {
    return (
      <ol className="flex w-full items-start">
        {steps.map((step, i) => (
          <li key={step.label} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "h-px flex-1",
                  i === 0 ? "opacity-0" : step.state === "upcoming" ? "bg-line" : "bg-accent"
                )}
              />
              <Dot state={step.state} />
              <div
                className={cn(
                  "h-px flex-1",
                  i === steps.length - 1
                    ? "opacity-0"
                    : steps[i + 1].state === "upcoming"
                    ? "bg-line"
                    : "bg-accent"
                )}
              />
            </div>
            <span
              className={cn(
                "mt-3 text-xs font-medium",
                step.state === "upcoming" ? "text-muted" : "text-ink"
              )}
            >
              {step.label}
            </span>
            {step.timestamp && (
              <span className="mt-0.5 font-mono-data text-[11px] text-muted">
                {step.timestamp}
              </span>
            )}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="relative">
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
          {i !== steps.length - 1 && (
            <span
              className={cn(
                "absolute left-[9px] top-6 h-full w-px",
                step.state === "upcoming" ? "bg-line" : "bg-accent"
              )}
            />
          )}
          <Dot state={step.state} />
          <div className="pt-0.5">
            <p className={cn("text-sm font-medium", step.state === "upcoming" ? "text-muted" : "text-ink")}>
              {step.label}
            </p>
            {step.timestamp && (
              <p className="mt-0.5 font-mono-data text-xs text-muted">{step.timestamp}</p>
            )}
            {step.note && <p className="mt-1 text-sm text-muted">{step.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Dot({ state }: { state: TimelineStep["state"] }) {
  return (
    <span
      className={cn(
        "relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
        state === "done" && "border-accent bg-accent",
        state === "current" && "border-accent bg-paper",
        state === "upcoming" && "border-line bg-paper"
      )}
    >
      {state === "current" && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
    </span>
  );
}
