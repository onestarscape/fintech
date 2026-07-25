import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function BuilderOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: builder } = await supabase.from("builders").select("*").eq("id", user!.id).single();
  const { data: projects } = await supabase.from("projects").select("id").eq("builder_id", user!.id);
  const projectIds = projects?.map((p) => p.id) ?? [];

  const [{ count: leadCount }, { count: convertedCount }] = await Promise.all([
    projectIds.length
      ? supabase.from("leads").select("*", { count: "exact", head: true }).in("project_id", projectIds)
      : Promise.resolve({ count: 0 }),
    projectIds.length
      ? supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("status", "converted")
      : Promise.resolve({ count: 0 }),
  ]);

  const stats = [
    { label: "Projects registered", value: projects?.length ?? 0 },
    { label: "Total loan requests", value: leadCount ?? 0 },
    { label: "Converted", value: convertedCount ?? 0 },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {builder?.company_name || "Builder overview"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Register projects and submit bulk home loan requests for your buyers.
          </p>
        </div>
        <Link href="/builder/projects" className={cn(buttonVariants({ variant: "accent", size: "sm" }))}>
          Manage projects
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="font-display mt-2 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
