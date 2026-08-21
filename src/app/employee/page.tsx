import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeFollowUp } from "@/lib/actions/employee";

function nowISOString() {
  return new Date().toISOString();
}

export default async function EmployeeOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const now = nowISOString();

  const [{ count: leadCount }, { count: appCount }, { count: queueCount }, { data: dueFollowUps }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", user!.id),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("assigned_rm_id", user!.id),
      supabase.from("leads").select("*", { count: "exact", head: true }).is("assigned_to", null),
      supabase
        .from("follow_ups")
        .select("*, leads(full_name), applications(id)")
        .eq("assigned_to", user!.id)
        .eq("is_done", false)
        .order("due_at", { ascending: true, nullsFirst: false })
        .returns<any[]>(),
    ]);

  const overdueCount = (dueFollowUps ?? []).filter((f) => f.due_at && f.due_at < now).length;

  const stats = [
    { label: "My leads", value: leadCount ?? 0 },
    { label: "My applications", value: appCount ?? 0 },
    { label: "Overdue follow-ups", value: overdueCount, alert: overdueCount > 0 },
    { label: "Unassigned queue", value: queueCount ?? 0 },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className={`p-6 ${s.alert ? "border-danger/30 bg-danger-soft/30" : ""}`}>
            <p className="text-sm text-muted">{s.label}</p>
            <p className={`font-display mt-2 text-3xl font-semibold ${s.alert ? "text-danger" : ""}`}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold">Open follow-ups &amp; tasks</h2>
      <div className="mt-4 space-y-2">
        {dueFollowUps?.map((f) => {
          const isOverdue = f.due_at && f.due_at < now;
          return (
            <Card
              key={f.id}
              className={`flex items-center justify-between p-4 ${isOverdue ? "border-danger/40 bg-danger-soft/30" : ""}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  {isOverdue && <AlertCircle className="h-3.5 w-3.5 text-danger" />}
                  <p className="text-sm">{f.note}</p>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {f.leads?.full_name && <>Lead: {f.leads.full_name} · </>}
                  {f.due_at ? (
                    <span className={isOverdue ? "font-medium text-danger" : ""}>
                      {isOverdue ? "Overdue — " : "Due "}
                      {new Date(f.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  ) : (
                    "No due date"
                  )}
                </p>
              </div>
              <form action={completeFollowUp}>
                <input type="hidden" name="follow_up_id" value={f.id} />
                <Button type="submit" variant="outline" size="sm">
                  Mark done
                </Button>
              </form>
            </Card>
          );
        })}
        {!dueFollowUps?.length && (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted">Nothing pending — nice work.</p>
          </Card>
        )}
      </div>

      <div className="mt-8">
        <Link href="/employee/leads" className="text-sm font-medium text-accent">
          View my leads →
        </Link>
      </div>
    </div>
  );
}
