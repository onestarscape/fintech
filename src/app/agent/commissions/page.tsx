import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AgentCommissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, applications(products(name))")
    .eq("agent_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<any[]>();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Commissions</h1>
      <p className="mt-1 text-sm text-muted">
        Logged once a referred application is disbursed and verified by our team.
      </p>

      <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line bg-black/[0.02] text-left text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Disbursed amount</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {commissions?.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">{c.applications?.products?.name}</td>
                <td className="px-4 py-3 font-mono-data">
                  {c.disbursed_amount ? `₹${Number(c.disbursed_amount).toLocaleString("en-IN")}` : "—"}
                </td>
                <td className="px-4 py-3 font-mono-data font-medium">
                  ₹{Number(c.commission_amount).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={c.status === "paid" ? "success" : c.status === "approved" ? "accent" : "warning"}>
                    {c.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!commissions?.length && (
          <p className="p-6 text-center text-sm text-muted">No commissions logged yet.</p>
        )}
      </div>
    </div>
  );
}
