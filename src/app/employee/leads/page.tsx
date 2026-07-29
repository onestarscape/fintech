import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { claimLead, updateLeadStatus, addFollowUp } from "@/lib/actions/employee";

const LEAD_STATUSES = ["new", "contacted", "converted", "dropped"];

export default async function EmployeeLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: myLeads }, { data: unassigned }] = await Promise.all([
    supabase
      .from("leads")
      .select("*, products(name), follow_ups(*)")
      .eq("assigned_to", user!.id)
      .order("created_at", { ascending: false })
    .limit(100)
      .returns<any[]>(),
    supabase
      .from("leads")
      .select("*, products(name)")
      .is("assigned_to", null)
      .order("created_at", { ascending: false })
      .returns<any[]>(),
  ]);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">My leads</h1>
        <div className="mt-4 space-y-3">
          {myLeads?.map((lead) => (
            <Card key={lead.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{lead.full_name}</p>
                  <p className="text-sm text-muted">
                    {lead.products?.name} · {lead.phone} · {lead.city}
                  </p>
                </div>
                <form action={updateLeadStatus} className="flex items-center gap-2">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <Select name="status" defaultValue={lead.status} className="h-9 text-xs">
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                  <Button type="submit" variant="outline" size="sm">Update</Button>
                </form>
              </div>

              {lead.requirement && (
                <p className="mt-3 text-sm text-muted">&ldquo;{lead.requirement}&rdquo;</p>
              )}

              <div className="mt-4 border-t border-line pt-4">
                <p className="text-xs font-medium text-muted">Notes &amp; follow-ups</p>
                <div className="mt-2 space-y-1.5">
                  {lead.follow_ups?.map((f: any) => (
                    <p key={f.id} className={`text-sm ${f.is_done ? "text-muted line-through" : ""}`}>
                      {f.note}
                      {f.due_at && (
                        <span className="ml-2 font-mono-data text-xs text-muted">
                          due {new Date(f.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
                <form action={addFollowUp} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <Input name="note" placeholder="Add a note or follow-up…" className="h-9 flex-1 text-sm" required />
                  <div className="flex gap-2">
                    <Input name="due_at" type="date" className="h-9 w-full text-sm sm:w-36" />
                    <Button type="submit" variant="ghost" size="sm">Add</Button>
                  </div>
                </form>
              </div>
            </Card>
          ))}
          {!myLeads?.length && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted">No leads assigned to you yet — claim one below.</p>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">Unassigned queue</h2>
        <div className="mt-4 space-y-2">
          {unassigned?.map((lead) => (
            <Card key={lead.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{lead.full_name}</p>
                <p className="text-xs text-muted">{lead.products?.name} · {lead.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="accent">new</Badge>
                <form action={claimLead}>
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <Button type="submit" variant="accent" size="sm">Claim</Button>
                </form>
              </div>
            </Card>
          ))}
          {!unassigned?.length && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted">Queue is empty.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
