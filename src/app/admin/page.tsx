import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { refreshProductCache } from "@/lib/actions/cache";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: leadCount }, { count: appCount }, { count: pendingCount }, { count: productCount }, { count: partnerCount }] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("applications").select("*", { count: "exact", head: true }),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("status", ["submitted", "under_review", "action_required"]),
      // Fetched directly, uncached — always reflects the real database
      // right now, so you can compare it against what the (cached)
      // public site is showing if something looks off after a migration.
      supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("partners").select("*", { count: "exact", head: true }).eq("is_active", true),
    ]);

  const stats = [
    { label: "Total leads", value: leadCount ?? 0 },
    { label: "Total applications", value: appCount ?? 0 },
    { label: "Needs attention", value: pendingCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="font-display mt-2 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Live products &amp; partners</h2>
            <p className="mt-1 text-sm text-muted">
              {productCount ?? 0} active product{productCount === 1 ? "" : "s"} ·{" "}
              {partnerCount ?? 0} active partner{partnerCount === 1 ? "" : "s"} in the database
              right now.
            </p>
            <p className="mt-1 text-xs text-muted">
              The public site caches this for up to 5 minutes for speed.
              After running a migration that changes products or
              partners, click refresh instead of waiting.
            </p>
          </div>
          <form action={refreshProductCache}>
            <Button type="submit" variant="outline" size="md">
              Refresh public site now
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
