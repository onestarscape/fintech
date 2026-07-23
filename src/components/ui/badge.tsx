import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/database";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-black/5 text-ink",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    accent: "bg-accent-soft text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_MAP: Record<ApplicationStatus, { label: string; tone: "neutral" | "success" | "warning" | "danger" | "accent" }> = {
  in_progress: { label: "In Progress", tone: "neutral" },
  submitted: { label: "Submitted", tone: "accent" },
  under_review: { label: "Under Review", tone: "warning" },
  action_required: { label: "Action Required", tone: "danger" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  disbursed: { label: "Disbursed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_MAP[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
