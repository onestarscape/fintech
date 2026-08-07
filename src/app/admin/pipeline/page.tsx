import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/types/database";

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: "submitted", label: "Submitted" },
  { status: "under_review", label: "Under Review" },
  { status: "action_required", label: "Action Required" },
  { status: "approved", label: "Approved" },
  { status: "disbursed", label: "Disbursed" },
];

function daysSince(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export default async function AdminPipelinePage() {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, current_stage, updated_at, products(name), leads(full_name)")
    .in("status", COLUMNS.map((c) => c.status))
    .order("updated_at", { ascending: true })
    .limit(300)
    .returns<any[]>();

  const grouped = COLUMNS.map((col) => ({
    ...col,
    items: (applications ?? []).filter((a) => a.status === col.status),
  }));

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-1 text-sm text-muted">
            Every active application, at a glance. Cards flagged red haven&apos;t moved in over 5 days.
          </p>
        </div>
        <Link href="/admin/applications" className="text-xs font-medium text-accent">
          Full list →
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="flex gap-4" style={{ minWidth: `${COLUMNS.length * 260}px` }}>
          {grouped.map((col) => (
            <div key={col.status} className="w-64 shrink-0">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{col.label}</p>
                <span className="font-mono-data text-xs text-muted">{col.items.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {col.items.map((app) => {
                  const age = daysSince(app.updated_at);
                  const stale = age > 5;
                  return (
                    <Link key={app.id} href={`/admin/applications/${app.id}`}>
                      <div
                        className={`rounded-[var(--radius-sm)] border bg-surface p-3 text-sm hover:shadow-[0_4px_16px_rgba(18,19,26,0.06)] ${
                          stale ? "border-danger/40" : "border-line"
                        }`}
                      >
                        <p className="font-medium">{app.leads?.full_name}</p>
                        <p className="mt-0.5 text-xs text-muted">{app.products?.name}</p>
                        <p className="mt-1 text-xs text-muted">{app.current_stage}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-mono-data text-[11px] text-muted">
                            {age === 0 ? "today" : `${age}d ago`}
                          </span>
                          {stale && <Badge tone="danger">Stale</Badge>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {!col.items.length && (
                  <p className="rounded-[var(--radius-sm)] border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
                    Empty
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
