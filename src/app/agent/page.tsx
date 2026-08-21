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

export default async function AgentOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: agent }, { count: leadCount }, { count: convertedCount }, { data: commissions }, { data: staleLeads }] =
    await Promise.all([
      supabase.from("agents").select("*").eq("id", user!.id).single(),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("agent_id", user!.id),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agent_id", user!.id)
        .eq("status", "converted"),
      supabase.from("commissions").select("commission_amount, status").eq("agent_id", user!.id),
      // Referrals nobody's touched in 5+ days — worth a nudge, either to
      // the customer directly or to Fast Up Loans support.
      supabase
        .from("leads")
        .select("id, full_name, created_at, products(name)")
        .eq("agent_id", user!.id)
        .eq("status", "new")
        .lt("created_at", fiveDaysAgoISOString())
        .order("created_at", { ascending: true })
        .returns<any[]>(),
    ]);

  const totalEarned = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0;
  const pendingEarned =
    commissions
      ?.filter((c) => c.status !== "paid")
      .reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0;

  const stats = [
    { label: "Customers referred", value: leadCount ?? 0 },
    { label: "Converted", value: convertedCount ?? 0 },
    { label: "Total commission", value: `₹${totalEarned.toLocaleString("en-IN")}` },
    {
      label: "Pending payout",
      value: `₹${pendingEarned.toLocaleString("en-IN")}`,
      alert: pendingEarned > 0,
    },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {agent?.agency_name || "Agent overview"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Commission rate: {agent?.commission_rate}% of disbursed loan amount
          </p>
        </div>
        <Link href="/agent/refer" className={cn(buttonVariants({ variant: "accent", size: "sm" }))}>
          Refer a customer
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className={`p-6 ${s.alert ? "border-accent/30 bg-accent-soft/40" : ""}`}>
            <p className="text-sm text-muted">{s.label}</p>
            <p className={`font-display mt-2 text-2xl font-semibold ${s.alert ? "text-accent" : ""}`}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {!!staleLeads?.length && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold">
              {staleLeads.length} referral{staleLeads.length === 1 ? "" : "s"} haven&apos;t moved in 5+ days
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Worth a quick check-in with the customer, or a nudge to our team.
          </p>
          <div className="mt-3 space-y-2">
            {staleLeads.map((lead) => (
              <Card key={lead.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{lead.full_name}</p>
                  <p className="text-xs text-muted">{lead.products?.name}</p>
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
