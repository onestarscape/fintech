import Link from "next/link";
import { AlertTriangle, Users, Handshake, Building2, FileText, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { refreshProductCache } from "@/lib/actions/cache";

function getFiveDaysAgoISOString() {
  return new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const fiveDaysAgo = getFiveDaysAgoISOString();

  const [
    { count: leadCount },
    { count: appCount },
    { count: pendingCount },
    { count: productCount },
    { count: partnerCount },
    { count: unassignedLeads },
    { count: pendingAgents },
    { count: pendingBuilders },
    { count: pendingDocs },
    { count: staleApps },
    { count: outstandingCommissions },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "action_required"]),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("partners").select("*", { count: "exact", head: true }).eq("is_active", true),
    // Action items — everything below is something a real person is
    // waiting on staff for. This is the actual point of an admin
    // homepage: not just numbers, but "here's what needs you today."
    supabase.from("leads").select("*", { count: "exact", head: true }).is("assigned_to", null),
    supabase.from("agents").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("builders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "action_required", "approved"])
      .lt("updated_at", fiveDaysAgo),
    supabase.from("commissions").select("*", { count: "exact", head: true }).neq("status", "paid"),
    supabase
      .from("status_history")
      .select("id, status, stage, created_at, applications(products(name), leads(full_name))")
      .order("created_at", { ascending: false })
      .limit(15)
      .returns<any[]>(),
  ]);

  const actionItems = [
    {
      label: "Unassigned leads",
      count: unassignedLeads ?? 0,
      href: "/admin/leads",
      icon: <Users className="h-4 w-4" strokeWidth={1.75} />,
    },
    {
      label: "Documents pending review",
      count: pendingDocs ?? 0,
      href: "/admin/documents",
      icon: <FileText className="h-4 w-4" strokeWidth={1.75} />,
    },
    {
      label: "Applications stuck 5+ days",
      count: staleApps ?? 0,
      href: "/admin/pipeline",
      icon: <Clock className="h-4 w-4" strokeWidth={1.75} />,
    },
    {
      label: "Agent applications to approve",
      count: pendingAgents ?? 0,
      href: "/admin/agents",
      icon: <Handshake className="h-4 w-4" strokeWidth={1.75} />,
    },
    {
      label: "Builder applications to approve",
      count: pendingBuilders ?? 0,
      href: "/admin/builders",
      icon: <Building2 className="h-4 w-4" strokeWidth={1.75} />,
    },
    {
      label: "Outstanding commissions",
      count: outstandingCommissions ?? 0,
      href: "/admin/agents",
      icon: <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />,
    },
  ];

  const totalActionItems = actionItems.reduce((sum, i) => sum + i.count, 0);
  const stats = [
    { label: "Total leads", value: leadCount ?? 0 },
    { label: "Total applications", value: appCount ?? 0 },
    { label: "Needs attention", value: pendingCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Overview</h1>

      {/* ACTION CENTER — the actual point of this page: what needs a
          human right now, not just numbers. */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {totalActionItems > 0 ? `${totalActionItems} things need your attention` : "Nothing needs attention"}
          </h2>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actionItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Card
                className={`flex items-center justify-between p-4 hover:shadow-[0_4px_16px_rgba(18,19,26,0.06)] ${
                  item.count > 0 ? "border-accent/30 bg-accent-soft/40" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={item.count > 0 ? "text-accent" : "text-muted"}>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className={`font-display text-lg font-semibold ${item.count > 0 ? "text-accent" : "text-muted"}`}>
                  {item.count}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="font-display mt-2 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Live products &amp; partners</h2>
            <p className="mt-1 text-sm text-muted">
              {productCount ?? 0} active product{productCount === 1 ? "" : "s"} ·{" "}
              {partnerCount ?? 0} active partner{partnerCount === 1 ? "" : "s"} in the database
              right now.
            </p>
            <p className="mt-1 text-xs text-muted">
              The public site caches this for up to 5 minutes for speed.
              After running a migration that changes products or
              partners, click refresh instead of waiting.
            </p>
          </div>
          <form action={refreshProductCache}>
            <Button type="submit" variant="outline" size="md">
              Refresh public site now
            </Button>
          </form>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Recent activity</h2>
        <Card className="mt-3 divide-y divide-line p-0">
          {(recentActivity ?? []).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <span className="font-medium">{entry.applications?.leads?.full_name ?? "Someone"}</span>
                <span className="text-muted">
                  {" "}
                  · {entry.applications?.products?.name} moved to{" "}
                  <span className="text-ink">{entry.status.replace(/_/g, " ")}</span>
                  {entry.stage ? ` (${entry.stage})` : ""}
                </span>
              </div>
              <span className="shrink-0 font-mono-data text-xs text-muted">
                {new Date(entry.created_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
          {!recentActivity?.length && (
            <p className="p-6 text-center text-sm text-muted">No activity yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
