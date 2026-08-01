import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Timeline, type TimelineStep } from "@/components/shared/timeline";
import { DocumentUploader } from "@/components/shared/document-uploader";
import type { RequiredDocumentDef } from "@/types/database";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: application } = await supabase
    .from("applications")
    .select("*, products(*), assigned_rm:profiles!applications_assigned_rm_id_fkey(full_name, phone)")
    .eq("id", id)
    .single<any>();

  if (!application) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();
  const customerName = profile?.full_name || user?.email || "Customer";

  const { data: history } = await supabase
    .from("status_history")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: true });

  const { data: documents } = await supabase
    .from("documents")
    .select("doc_key")
    .eq("application_id", id);

  const product = application.products;
  const stages: string[] = product?.workflow_stages ?? [];
  const currentIndex = stages.indexOf(application.current_stage ?? "");

  const timelineSteps: TimelineStep[] = stages.map((stage, i) => {
    const historyEntry = history?.find((h) => h.stage === stage);
    return {
      label: stage,
      timestamp: historyEntry
        ? new Date(historyEntry.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })
        : undefined,
      state: i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming",
    };
  });

  const requiredDocs = (product?.required_documents ?? []) as RequiredDocumentDef[];
  const uploadedKeys = (documents ?? []).map((d) => d.doc_key);

  const rm = application.assigned_rm;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-accent">{product?.name}</p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">
            Application {application.id.slice(0, 8).toUpperCase()}
          </h1>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <Card className="p-6">
          <h2 className="text-sm font-semibold">Timeline</h2>
          <div className="mt-5">
            <Timeline steps={timelineSteps} orientation="vertical" />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold">Relationship manager</h2>
            {rm ? (
              <div className="mt-3 text-sm">
                <p className="font-medium">{rm.full_name}</p>
                <p className="text-muted">{rm.phone}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Will be assigned shortly after review.
              </p>
            )}
          </Card>

          {requiredDocs.length > 0 ? (
            <Card className="p-6">
              <h2 className="text-sm font-semibold">Documents</h2>
              <div className="mt-4">
                <DocumentUploader
                  applicationId={application.id}
                  customerName={customerName}
                  requiredDocuments={requiredDocs}
                  uploadedKeys={uploadedKeys}
                />
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <h2 className="text-sm font-semibold">What happens next</h2>
              <p className="mt-3 text-sm text-muted">
                No documents needed for this request. Our team will process
                it and message you here with the result — check your{" "}
                <Link href="/dashboard/messages" className="text-accent">
                  Messages
                </Link>{" "}
                and{" "}
                <Link href="/dashboard/notifications" className="text-accent">
                  Notifications
                </Link>{" "}
                for updates.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
