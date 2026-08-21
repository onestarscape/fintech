import Link from "next/link";
import { AlertCircle } from "lucide-react";
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

  // Surface anything that actually needs the customer to act — a
  // rejected document is the single most common thing that silently
  // stalls an application if nobody tells the customer to fix it.
  const applicationIds = (applications ?? []).map((a) => a.id);
  const { data: rejectedDocs } = applicationIds.length
    ? await supabase
        .from("documents")
        .select("id, label, rejection_reason, application_id")
        .eq("status", "rejected")
        .in("application_id", applicationIds)
    : { data: [] };

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

      {!!rejectedDocs?.length && (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-danger/30 bg-danger-soft/50 p-5">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-danger" />
            <p className="text-sm font-semibold text-danger">
              {rejectedDocs.length} document{rejectedDocs.length === 1 ? "" : "s"} need{rejectedDocs.length === 1 ? "s" : ""} your attention
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {rejectedDocs.map((doc) => (
              <Link
                key={doc.id}
                href={`/dashboard/applications/${doc.application_id}`}
                className="block rounded-[var(--radius-sm)] bg-surface px-3.5 py-2.5 text-sm hover:bg-black/[0.02]"
              >
                <span className="font-medium">{doc.label}</span>
                {doc.rejection_reason && (
                  <span className="text-muted"> — {doc.rejection_reason}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

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
