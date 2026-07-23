import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Timeline, type TimelineStep } from "@/components/shared/timeline";
import { MessageThread } from "@/components/shared/message-thread";
import { updateApplicationStatus, assignRelationshipManager, verifyDocument } from "@/lib/actions/admin";
import type { ApplicationStatus, RequiredDocumentDef } from "@/types/database";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "in_progress", "submitted", "under_review", "action_required",
  "approved", "rejected", "disbursed", "cancelled",
];

export default async function AdminApplicationDetailPage({
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
    .select("*, products(*), leads(*)")
    .eq("id", id)
    .single<any>();

  if (!application) notFound();

  const [{ data: history }, { data: documents }, { data: staff }, { data: messages }] = await Promise.all([
    supabase.from("status_history").select("*").eq("application_id", id).order("created_at"),
    supabase.from("documents").select("*").eq("application_id", id),
    supabase.from("profiles").select("id, full_name").in("role", ["admin", "employee"]),
    supabase.from("messages").select("*").eq("application_id", id).order("created_at", { ascending: true }),
  ]);

  const product = application.products;
  const lead = application.leads;
  const stages: string[] = product?.workflow_stages ?? [];
  const currentIndex = stages.indexOf(application.current_stage ?? "");
  const requiredDocs = (product?.required_documents ?? []) as RequiredDocumentDef[];

  const timelineSteps: TimelineStep[] = stages.map((stage, i) => ({
    label: stage,
    state: i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming",
  }));

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-accent">{product?.name}</p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">
            {lead?.full_name}
          </h1>
          <p className="mt-1 text-sm text-muted">{lead?.phone} · {lead?.email} · {lead?.city}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold">Timeline</h2>
            <div className="mt-5">
              <Timeline steps={timelineSteps} orientation="vertical" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Submitted details</h2>
            <div className="mt-4 space-y-1.5">
              {Object.entries((application.form_data as Record<string, string>) ?? {}).map(
                ([key, value]) => (
                  <p key={key} className="text-sm text-muted">
                    <span className="text-ink">{key.replace(/_/g, " ")}:</span> {String(value)}
                  </p>
                )
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold">Update status</h2>
            <form action={updateApplicationStatus} className="mt-4 space-y-3">
              <input type="hidden" name="application_id" value={application.id} />
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={application.status}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="stage">Stage</Label>
                <Select id="stage" name="stage" defaultValue={application.current_stage ?? ""}>
                  {stages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="note">Note (visible internally)</Label>
                <Input id="note" name="note" placeholder="Optional note" />
              </div>
              <Button type="submit" variant="accent" size="md" className="w-full">
                Save update
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Relationship manager</h2>
            <form action={assignRelationshipManager} className="mt-4 flex gap-2">
              <input type="hidden" name="application_id" value={application.id} />
              <Select name="rm_id" defaultValue={application.assigned_rm_id ?? ""} className="flex-1">
                <option value="">Unassigned</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name ?? s.id.slice(0, 8)}</option>
                ))}
              </Select>
              <Button type="submit" variant="outline" size="md">Assign</Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Documents</h2>
            <div className="mt-4 space-y-2">
              {requiredDocs.map((doc) => {
                const uploaded = documents?.find((d) => d.doc_key === doc.key);
                return (
                  <div key={doc.key} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-line px-3 py-2 text-sm">
                    <span>{doc.label}</span>
                    {!uploaded ? (
                      <span className="text-xs text-muted">Not uploaded</span>
                    ) : uploaded.verified ? (
                      <span className="text-xs font-medium text-success">Verified</span>
                    ) : (
                      <form action={verifyDocument}>
                        <input type="hidden" name="document_id" value={uploaded.id} />
                        <input type="hidden" name="application_id" value={application.id} />
                        <button type="submit" className="text-xs font-medium text-accent">
                          Mark verified
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-sm font-semibold">Messages</h2>
            <div className="mt-4 h-96">
              <MessageThread applicationId={application.id} messages={messages ?? []} currentUserId={user!.id} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
