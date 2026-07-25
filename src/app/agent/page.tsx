import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AgentOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: agent }, { count: leadCount }, { count: convertedCount }, { data: commissions }] =
    await Promise.all([
      supabase.from("agents").select("*").eq("id", user!.id).single(),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("agent_id", user!.id),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agent_id", user!.id)
        .eq("status", "converted"),
      supabase.from("commissions").select("commission_amount, status").eq("agent_id", user!.id),
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
    { label: "Pending payout", value: `₹${pendingEarned.toLocaleString("en-IN")}` },
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
          <Card key={s.label} className="p-6">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="font-display mt-2 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
