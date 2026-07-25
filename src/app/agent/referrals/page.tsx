import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AgentReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads } = await supabase
    .from("leads")
    .select("*, products(name)")
    .eq("agent_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<any[]>();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">My referrals</h1>

      {submitted && (
        <div className="mt-4 rounded-[var(--radius-sm)] bg-success-soft px-3.5 py-2.5 text-sm text-success">
          Referral submitted — our team will reach out shortly.
        </div>
      )}

      <div className="mt-6 space-y-2">
        {leads?.map((lead) => (
          <Card key={lead.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{lead.full_name}</p>
              <p className="text-xs text-muted">{lead.products?.name} · {lead.phone} · {lead.city}</p>
            </div>
            <Badge
              tone={
                lead.status === "converted" ? "success" : lead.status === "dropped" ? "danger" : "accent"
              }
            >
              {lead.status}
            </Badge>
          </Card>
        ))}
        {!leads?.length && (
          <Card className="p-10 text-center">
            <p className="text-sm text-muted">No referrals yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
