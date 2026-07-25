import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function BuilderAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, leads(status)")
    .eq("builder_id", user!.id)
    .returns<any[]>();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-muted">Loan request breakdown by project.</p>

      <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-line bg-black/[0.02] text-left text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">New</th>
              <th className="px-4 py-3">Contacted</th>
              <th className="px-4 py-3">Converted</th>
              <th className="px-4 py-3">Dropped</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects?.map((p) => {
              const leads = p.leads ?? [];
              const count = (status: string) => leads.filter((l: any) => l.status === status).length;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono-data">{leads.length}</td>
                  <td className="px-4 py-3 font-mono-data">{count("new")}</td>
                  <td className="px-4 py-3 font-mono-data">{count("contacted")}</td>
                  <td className="px-4 py-3 font-mono-data text-success">{count("converted")}</td>
                  <td className="px-4 py-3 font-mono-data text-danger">{count("dropped")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {!projects?.length && (
          <p className="p-6 text-center text-sm text-muted">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
