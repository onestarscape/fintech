import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const [{ data: leads }, { data: applications }, { data: products }] = await Promise.all([
    supabase.from("leads").select("id, product_id, agent_id, project_id, status"),
    supabase.from("applications").select("id, product_id, status"),
    supabase.from("products").select("id, name, category").order("display_order"),
  ]);

  const totalLeads = leads?.length ?? 0;
  const totalApplications = applications?.length ?? 0;
  const totalDisbursed = applications?.filter((a) => a.status === "disbursed").length ?? 0;

  const funnelStages = [
    { label: "Leads", value: totalLeads },
    { label: "Applications", value: totalApplications },
    { label: "Disbursed / Issued", value: totalDisbursed },
  ];
  const maxFunnelValue = Math.max(...funnelStages.map((s) => s.value), 1);

  const directCount = leads?.filter((l) => !l.agent_id && !l.project_id).length ?? 0;
  const agentCount = leads?.filter((l) => l.agent_id).length ?? 0;
  const builderCount = leads?.filter((l) => l.project_id).length ?? 0;

  const perProduct = (products ?? []).map((p) => {
    const productLeads = leads?.filter((l) => l.product_id === p.id).length ?? 0;
    const productApps = applications?.filter((a) => a.product_id === p.id).length ?? 0;
    const productDisbursed =
      applications?.filter((a) => a.product_id === p.id && a.status === "disbursed").length ?? 0;
    const conversion = productLeads > 0 ? Math.round((productDisbursed / productLeads) * 100) : 0;
    return { ...p, productLeads, productApps, productDisbursed, conversion };
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Reports</h1>
      <p className="mt-1 text-sm text-muted">A business-level view — where leads come from and where they end up.</p>

      <Card className="mt-6 p-6">
        <h2 className="text-sm font-semibold">Overall funnel</h2>
        <div className="mt-4 space-y-3">
          {funnelStages.map((stage) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{stage.label}</span>
                <span className="font-mono-data font-medium text-ink">{stage.value}</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(stage.value / maxFunnelValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted">Direct leads</p>
          <p className="font-display mt-2 text-2xl font-semibold">{directCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted">Via agents</p>
          <p className="font-display mt-2 text-2xl font-semibold">{agentCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted">Via builders</p>
          <p className="font-display mt-2 text-2xl font-semibold">{builderCount}</p>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="p-6 pb-0">
          <h2 className="text-sm font-semibold">By product</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-line bg-black/[0.02] text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Disbursed / Issued</th>
                <th className="px-4 py-3">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {perProduct.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono-data">{p.productLeads}</td>
                  <td className="px-4 py-3 font-mono-data">{p.productApps}</td>
                  <td className="px-4 py-3 font-mono-data">{p.productDisbursed}</td>
                  <td className="px-4 py-3 font-mono-data">{p.conversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!perProduct.length && (
          <p className="p-6 text-center text-sm text-muted">No products yet.</p>
        )}
      </Card>
    </div>
  );
}
