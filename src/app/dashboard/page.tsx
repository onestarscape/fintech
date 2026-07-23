import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, products(name, slug, icon), assigned_rm:profiles!applications_assigned_rm_id_fkey(full_name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<any[]>();

  return (
    <div className="max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Your applications
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track every application in one place.
          </p>
        </div>
        <Link href="/#products" className={cn(buttonVariants({ variant: "accent", size: "sm" }))}>
          New application
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {applications?.map((app: any) => (
          <Link key={app.id} href={`/dashboard/applications/${app.id}`}>
            <Card className="p-5 transition-shadow hover:shadow-[0_8px_30px_rgba(18,19,26,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{app.products?.name}</p>
                  <p className="mt-1 font-mono-data text-xs text-muted">
                    Ref: {app.id.slice(0, 8).toUpperCase()} · Stage: {app.current_stage}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </Card>
          </Link>
        ))}

        {!applications?.length && (
          <Card className="p-10 text-center">
            <p className="text-sm text-muted">
              No applications yet. Starting one takes about two minutes.
            </p>
            <Link
              href="/#products"
              className={cn(buttonVariants({ variant: "accent", size: "md" }), "mt-4")}
            >
              Explore products
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
