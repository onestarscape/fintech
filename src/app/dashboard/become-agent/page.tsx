import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applyToBecomeAgent } from "@/lib/actions/agents";

export default async function BecomeAgentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Become an agent</h1>
      <p className="mt-1 text-sm text-muted">
        Refer customers who need a loan or insurance — earn a commission on
        every disbursed application you bring in.
      </p>

      {agent ? (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{agent.agency_name || "Individual agent"}</p>
              <p className="mt-1 text-xs text-muted">Commission rate: {agent.commission_rate}%</p>
            </div>
            <Badge tone={agent.status === "approved" ? "success" : agent.status === "suspended" ? "danger" : "warning"}>
              {agent.status}
            </Badge>
          </div>
          {agent.status === "pending" && (
            <p className="mt-4 text-sm text-muted">
              Your application is under review — you&apos;ll get access to the
              agent portal once approved.
            </p>
          )}
          {agent.status === "approved" && (
            <a href="/agent" className="mt-4 inline-block text-sm font-medium text-accent">
              Go to your agent portal →
            </a>
          )}
        </Card>
      ) : (
        <Card className="mt-6 p-6">
          <form action={applyToBecomeAgent} className="space-y-4">
            <div>
              <Label htmlFor="agency_name">Agency / business name (optional)</Label>
              <Input id="agency_name" name="agency_name" placeholder="Leave blank if applying as an individual" />
            </div>
            <Button type="submit" variant="accent" size="md">
              Submit application
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
