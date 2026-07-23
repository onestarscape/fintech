import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: leadCount }, { count: appCount }, { count: pendingCount }] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "action_required"]),
  ]);

  const stats = [
    { label: "Total leads", value: leadCount ?? 0 },
    { label: "Total applications", value: appCount ?? 0 },
    { label: "Needs attention", value: pendingCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="font-display mt-2 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
