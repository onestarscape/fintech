import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function EmployeeApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query: any = supabase
    .from("applications")
    .select("*, products(name), leads(full_name, phone)")
    .eq("assigned_rm_id", user!.id)
    .returns<any[]>();

  if (q) {
    const { data: matchingLeads } = await supabase
      .from("leads")
      .select("id")
      .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
    const leadIds = (matchingLeads ?? []).map((l) => l.id);
    query = query.in("lead_id", leadIds.length ? leadIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: applications } = await query.order("created_at", { ascending: false }).limit(100);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">My applications</h1>

      <form className="mt-4 flex gap-3" method="get">
        <div className="max-w-xs flex-1">
          <Input name="q" placeholder="Search applicant name or phone…" defaultValue={q ?? ""} />
        </div>
        <Button type="submit" variant="outline" size="md">Search</Button>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {applications?.map((app: any) => (
              <tr key={app.id} className="hover:bg-black/[0.015]">
                <td className="px-4 py-3">
                  <Link href={`/employee/applications/${app.id}`} className="font-medium text-accent">
                    {app.leads?.full_name}
                  </Link>
                  <p className="text-xs text-muted">{app.leads?.phone}</p>
                </td>
                <td className="px-4 py-3">{app.products?.name}</td>
                <td className="px-4 py-3 text-muted">{app.current_stage}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!applications?.length && (
          <p className="p-6 text-center text-sm text-muted">
            {q ? "No matches found." : "No applications assigned to you yet."}
          </p>
        )}
      </div>
    </div>
  );
}
