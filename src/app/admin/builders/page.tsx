import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveBuilder, suspendBuilder } from "@/lib/actions/admin";

export default async function AdminBuildersPage() {
  const supabase = await createClient();
  const { data: builders } = await supabase
    .from("builders")
    .select("*, profiles!builders_id_fkey(full_name, phone), projects(id, name)")
    .order("created_at", { ascending: false })
    .returns<any[]>();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Builders</h1>
      <div className="mt-6 space-y-3">
        {builders?.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{b.company_name || b.profiles?.full_name || "Unnamed builder"}</p>
                <p className="text-sm text-muted">{b.profiles?.phone}</p>
                <p className="mt-1 text-xs text-muted">
                  {b.projects?.length ?? 0} project{b.projects?.length === 1 ? "" : "s"} registered
                </p>
              </div>
              <Badge tone={b.status === "approved" ? "success" : b.status === "suspended" ? "danger" : "warning"}>
                {b.status}
              </Badge>
            </div>

            {b.status === "pending" && (
              <form action={approveBuilder} className="mt-4">
                <input type="hidden" name="builder_id" value={b.id} />
                <Button type="submit" variant="accent" size="sm">Approve</Button>
              </form>
            )}
            {b.status === "approved" && (
              <form action={suspendBuilder} className="mt-4">
                <input type="hidden" name="builder_id" value={b.id} />
                <Button type="submit" variant="outline" size="sm">Suspend</Button>
              </form>
            )}
          </Card>
        ))}
        {!builders?.length && (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted">No builder applications yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
