import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";

export default async function EmployeeApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, products(name), leads(full_name, phone)")
    .eq("assigned_rm_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<any[]>();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">My applications</h1>
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
            {applications?.map((app) => (
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
            No applications assigned to you yet.
          </p>
        )}
      </div>
    </div>
  );
}
