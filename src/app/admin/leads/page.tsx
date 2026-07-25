import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*, products(name)").returns<any[]>()
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Leads</h1>
      <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line bg-black/[0.02] text-left text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads?.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-3 font-medium">{lead.full_name}</td>
                <td className="px-4 py-3 font-mono-data">{lead.phone}</td>
                <td className="px-4 py-3">{lead.products?.name}</td>
                <td className="px-4 py-3">{lead.city}</td>
                <td className="px-4 py-3">
                  <Badge tone={lead.status === "new" ? "accent" : "neutral"}>{lead.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(lead.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!leads?.length && (
          <p className="p-6 text-center text-sm text-muted">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
