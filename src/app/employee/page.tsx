import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeFollowUp } from "@/lib/actions/employee";

export default async function EmployeeOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: leadCount }, { count: appCount }, { data: dueFollowUps }] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", user!.id),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("assigned_rm_id", user!.id),
    supabase
      .from("follow_ups")
      .select("*, leads(full_name), applications(id)")
      .eq("assigned_to", user!.id)
      .eq("is_done", false)
      .order("due_at", { ascending: true, nullsFirst: false })
      .returns<any[]>(),
  ]);

  const stats = [
    { label: "My leads", value: leadCount ?? 0 },
    { label: "My applications", value: appCount ?? 0 },
    { label: "Open follow-ups", value: dueFollowUps?.length ?? 0 },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="font-display mt-2 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold">Open follow-ups &amp; tasks</h2>
      <div className="mt-4 space-y-2">
        {dueFollowUps?.map((f) => (
          <Card key={f.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm">{f.note}</p>
              <p className="mt-1 text-xs text-muted">
                {f.leads?.full_name && <>Lead: {f.leads.full_name} · </>}
                {f.due_at
                  ? `Due ${new Date(f.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                  : "No due date"}
              </p>
            </div>
            <form action={completeFollowUp}>
              <input type="hidden" name="follow_up_id" value={f.id} />
              <Button type="submit" variant="outline" size="sm">
                Mark done
              </Button>
            </form>
          </Card>
        ))}
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
