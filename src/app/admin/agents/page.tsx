import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { approveAgent, suspendAgent, markCommissionPaid } from "@/lib/actions/admin";

export default async function AdminAgentsPage() {
  const supabase = await createClient();

  const [{ data: agents }, { data: pendingCommissions }] = await Promise.all([
    supabase
      .from("agents")
      .select("*, profiles!agents_id_fkey(full_name, phone)")
      .order("created_at", { ascending: false })
      .returns<any[]>(),
    supabase
      .from("commissions")
      .select("*, agents(agency_name, profiles!agents_id_fkey(full_name)), applications(products(name))")
      .neq("status", "paid")
      .order("created_at", { ascending: false })
      .returns<any[]>(),
  ]);

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Agents</h1>
        <div className="mt-6 space-y-3">
          {agents?.map((agent) => (
            <Card key={agent.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{agent.agency_name || agent.profiles?.full_name || "Unnamed agent"}</p>
                  <p className="text-sm text-muted">{agent.profiles?.phone}</p>
                </div>
                <Badge tone={agent.status === "approved" ? "success" : agent.status === "suspended" ? "danger" : "warning"}>
                  {agent.status}
                </Badge>
              </div>

              {agent.status === "pending" && (
                <form action={approveAgent} className="mt-4 flex items-end gap-3">
                  <input type="hidden" name="agent_id" value={agent.id} />
                  <div>
                    <Label htmlFor={`rate-${agent.id}`}>Commission rate (%)</Label>
                    <Input
                      id={`rate-${agent.id}`}
                      name="commission_rate"
                      type="number"
                      step="0.01"
                      defaultValue="0.50"
                      className="w-28"
                    />
                  </div>
                  <Button type="submit" variant="accent" size="md">Approve</Button>
                </form>
              )}

              {agent.status === "approved" && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted">Rate: {agent.commission_rate}%</p>
                  <form action={suspendAgent}>
                    <input type="hidden" name="agent_id" value={agent.id} />
                    <Button type="submit" variant="outline" size="sm">Suspend</Button>
                  </form>
                </div>
              )}
            </Card>
          ))}
          {!agents?.length && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted">No agent applications yet.</p>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">Outstanding commissions</h2>
        <div className="mt-4 space-y-2">
          {pendingCommissions?.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  {c.agents?.agency_name || c.agents?.profiles?.full_name}
                </p>
                <p className="text-xs text-muted">{c.applications?.products?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-data text-sm font-medium">
                  ₹{Number(c.commission_amount).toLocaleString("en-IN")}
                </span>
                <Badge tone={c.status === "approved" ? "accent" : "warning"}>{c.status}</Badge>
                <form action={markCommissionPaid}>
                  <input type="hidden" name="commission_id" value={c.id} />
                  <Button type="submit" variant="outline" size="sm">Mark paid</Button>
                </form>
              </div>
            </Card>
          ))}
          {!pendingCommissions?.length && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted">Nothing outstanding.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
