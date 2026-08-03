import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STATUSES = [
  "in_progress", "submitted", "under_review", "action_required",
  "approved", "rejected", "disbursed", "cancelled",
];

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; product_id?: string }>;
}) {
  const { q, status, product_id } = await searchParams;
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .order("display_order");

  let query: any = supabase
    .from("applications")
    .select("*, products(name), leads(full_name, phone)")
    .returns<any[]>();

  // Applicant name/phone lives on the joined `leads` row, so it can't be
  // searched via a simple filter on `applications` directly — look up
  // matching lead ids first, then filter applications by those.
  if (q) {
    const { data: matchingLeads } = await supabase
      .from("leads")
      .select("id")
      .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
    const leadIds = (matchingLeads ?? []).map((l) => l.id);
    query = query.in("lead_id", leadIds.length ? leadIds : ["00000000-0000-0000-0000-000000000000"]);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (product_id) {
    query = query.eq("product_id", product_id);
  }

  const { data: applications } = await query.order("created_at", { ascending: false }).limit(100);

  const hasFilters = !!(q || status || product_id);

  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-xs text-muted">Showing latest 100 matching</p>
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3" method="get">
        <div className="min-w-[200px] flex-1">
          <Input name="q" placeholder="Search applicant name or phone…" defaultValue={q ?? ""} />
        </div>
        <Select name="status" defaultValue={status ?? ""} className="w-44">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </Select>
        <Select name="product_id" defaultValue={product_id ?? ""} className="w-48">
          <option value="">All products</option>
          {products?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <Button type="submit" variant="outline" size="md">Filter</Button>
        {hasFilters && (
          <Link href="/admin/applications" className="text-xs font-medium text-muted hover:text-ink">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line bg-black/[0.02] text-left text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {applications?.map((app: any) => (
              <tr key={app.id} className="hover:bg-black/[0.015]">
                <td className="px-4 py-3">
                  <Link href={`/admin/applications/${app.id}`} className="font-medium text-accent">
                    {app.leads?.full_name}
                  </Link>
                  <p className="text-xs text-muted">{app.leads?.phone}</p>
                </td>
                <td className="px-4 py-3">{app.products?.name}</td>
                <td className="px-4 py-3 text-muted">{app.current_stage}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 font-mono-data text-xs text-muted">
                  {app.id.slice(0, 8).toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!applications?.length && (
          <p className="p-6 text-center text-sm text-muted">
            {hasFilters ? "No applications match your filters." : "No applications yet."}
          </p>
        )}
      </div>
    </div>
  );
}
