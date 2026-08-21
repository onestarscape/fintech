import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { assignLeadToEmployee } from "@/lib/actions/admin";

const LEAD_STATUSES = ["new", "contacted", "converted", "dropped"];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; product_id?: string }>;
}) {
  const { q, status, product_id } = await searchParams;
  const supabase = await createClient();

  const [{ data: products }, { data: employees }] = await Promise.all([
    supabase.from("products").select("id, name").order("display_order"),
    supabase.from("profiles").select("id, full_name").in("role", ["employee", "admin"]),
  ]);

  let query: any = supabase
    .from("leads")
    .select("*, products(name)")
    .returns<any[]>();

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (product_id) {
    query = query.eq("product_id", product_id);
  }

  const { data: leads } = await query.order("created_at", { ascending: false }).limit(100);

  const hasFilters = !!(q || status || product_id);

  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-xs text-muted">Showing latest 100 matching</p>
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3" method="get">
        <div className="min-w-[200px] flex-1">
          <Input name="q" placeholder="Search name, phone, city…" defaultValue={q ?? ""} />
        </div>
        <Select name="status" defaultValue={status ?? ""} className="w-40">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
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
          <Link href="/admin/leads" className="text-xs font-medium text-muted hover:text-ink">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-line bg-black/[0.02] text-left text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned to</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads?.map((lead: any) => (
              <tr key={lead.id}>
                <td className="px-4 py-3 font-medium">{lead.full_name}</td>
                <td className="px-4 py-3 font-mono-data">{lead.phone}</td>
                <td className="px-4 py-3">{lead.products?.name}</td>
                <td className="px-4 py-3">{lead.city}</td>
                <td className="px-4 py-3">
                  <Badge tone={lead.status === "new" ? "accent" : "neutral"}>{lead.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <form action={assignLeadToEmployee} className="flex items-center gap-1.5">
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <Select
                      name="employee_id"
                      defaultValue={lead.assigned_to ?? ""}
                      className="h-8 w-36 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {employees?.map((e) => (
                        <option key={e.id} value={e.id}>{e.full_name ?? e.id.slice(0, 8)}</option>
                      ))}
                    </Select>
                    <button type="submit" className="text-xs font-medium text-accent">Set</button>
                  </form>
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
          <p className="p-6 text-center text-sm text-muted">
            {hasFilters ? "No leads match your filters." : "No leads yet."}
          </p>
        )}
      </div>
    </div>
  );
}
