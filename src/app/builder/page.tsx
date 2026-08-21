import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function fiveDaysAgoISOString() {
  return new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default async function BuilderOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: builder } = await supabase.from("builders").select("*").eq("id", user!.id).single();
  const { data: projects } = await supabase.from("projects").select("id, name").eq("builder_id", user!.id);
  const projectIds = projects?.map((p) => p.id) ?? [];

  const [{ count: leadCount }, { count: convertedCount }, { data: staleLeads }] = await Promise.all([
    projectIds.length
      ? supabase.from("leads").select("*", { count: "exact", head: true }).in("project_id", projectIds)
      : Promise.resolve({ count: 0 }),
    projectIds.length
      ? supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("status", "converted")
      : Promise.resolve({ count: 0 }),
    projectIds.length
      ? supabase
          .from("leads")
          .select("id, full_name, created_at, project_id")
          .in("project_id", projectIds)
          .eq("status", "new")
          .lt("created_at", fiveDaysAgoISOString())
          .order("created_at", { ascending: true })
          .returns<any[]>()
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const projectNameById = new Map((projects ?? []).map((p) => [p.id, p.name]));

  const stats = [
    { label: "Projects registered", value: projects?.length ?? 0 },
    { label: "Total loan requests", value: leadCount ?? 0 },
    { label: "Converted", value: convertedCount ?? 0 },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {builder?.company_name || "Builder overview"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Register projects and submit bulk home loan requests for your buyers.
          </p>
        </div>
        <Link href="/builder/projects" className={cn(buttonVariants({ variant: "accent", size: "sm" }))}>
          Manage projects
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="font-display mt-2 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      {!!staleLeads?.length && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold">
              {staleLeads.length} request{staleLeads.length === 1 ? "" : "s"} haven&apos;t moved in 5+ days
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">Worth a nudge to our team to move these along.</p>
          <div className="mt-3 space-y-2">
            {staleLeads.map((lead) => (
              <Card key={lead.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{lead.full_name}</p>
                  <p className="text-xs text-muted">{projectNameById.get(lead.project_id)}</p>
                </div>
                <Badge tone="warning">
                  {daysSince(lead.created_at)}d
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
