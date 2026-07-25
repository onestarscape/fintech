import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { bulkSubmitLeads } from "@/lib/actions/builders";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { id } = await params;
  const { submitted, error } = await searchParams;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="text-sm font-medium text-accent">Project</p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {project.location} {project.total_units ? `· ${project.total_units} units` : ""}
        </p>
      </div>

      {submitted && (
        <div className="rounded-[var(--radius-sm)] bg-success-soft px-3.5 py-2.5 text-sm text-success">
          {submitted} loan request{Number(submitted) === 1 ? "" : "s"} submitted successfully.
        </div>
      )}
      {error && (
        <div className="rounded-[var(--radius-sm)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-sm font-semibold">Bulk loan requests</h2>
        <p className="mt-1 text-xs text-muted">
          One buyer per line: <span className="font-mono-data">Full Name, Phone, City</span>
        </p>
        <form action={bulkSubmitLeads} className="mt-4 space-y-4">
          <input type="hidden" name="project_id" value={project.id} />
          <div>
            <Label htmlFor="product_id">Product</Label>
            <Select id="product_id" name="product_id" required defaultValue="">
              <option value="" disabled>
                Select a product…
              </option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="customers">Buyers</Label>
            <textarea
              id="customers"
              name="customers"
              rows={6}
              required
              placeholder={"Ramesh Kumar, 9876543210, Pune\nSunita Rao, 9876500000, Mumbai"}
              className="flex w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 py-2.5 font-mono-data text-xs placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
            />
          </div>
          <Button type="submit" variant="accent" size="md">
            Submit loan requests
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">Requests for this project</h2>
        <div className="mt-4 space-y-2">
          {leads?.map((lead) => (
            <Card key={lead.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{lead.full_name}</p>
                <p className="text-xs text-muted">{lead.phone} · {lead.city}</p>
              </div>
              <Badge tone={lead.status === "converted" ? "success" : lead.status === "dropped" ? "danger" : "accent"}>
                {lead.status}
              </Badge>
            </Card>
          ))}
          {!leads?.length && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted">No requests submitted yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
