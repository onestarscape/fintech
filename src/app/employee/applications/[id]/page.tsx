import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Timeline, type TimelineStep } from "@/components/shared/timeline";
import { MessageThread } from "@/components/shared/message-thread";
import { updateApplicationStatus, verifyDocument } from "@/lib/actions/admin";
import { addFollowUp, completeFollowUp } from "@/lib/actions/employee";
import type { ApplicationStatus, RequiredDocumentDef } from "@/types/database";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "in_progress", "submitted", "under_review", "action_required",
  "approved", "rejected", "disbursed", "cancelled",
];

export default async function EmployeeApplicationDetailPage({
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

  const [{ data: documents }, { data: messages }, { data: followUps }] = await Promise.all([
    supabase.from("documents").select("*").eq("application_id", id),
    supabase.from("messages").select("*").eq("application_id", id).order("created_at", { ascending: true }),
    supabase.from("follow_ups").select("*").eq("application_id", id).order("created_at", { ascending: false }),
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
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">{lead?.full_name}</h1>
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
                <Label htmlFor="note">Note (internal)</Label>
                <Input id="note" name="note" placeholder="Optional note" />
              </div>
              <Button type="submit" variant="accent" size="md" className="w-full">
                Save update
              </Button>
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
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold">Messages</h2>
            <div className="mt-4 h-72">
              <MessageThread applicationId={application.id} messages={messages ?? []} currentUserId={user!.id} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Follow-ups &amp; notes</h2>
            <div className="mt-3 space-y-1.5">
              {followUps?.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <p className={`text-sm ${f.is_done ? "text-muted line-through" : ""}`}>{f.note}</p>
                  {!f.is_done && (
                    <form action={completeFollowUp}>
                      <input type="hidden" name="follow_up_id" value={f.id} />
                      <button type="submit" className="text-xs font-medium text-accent">Done</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
            <form action={addFollowUp} className="mt-3 flex gap-2">
              <input type="hidden" name="application_id" value={application.id} />
              <Input name="note" placeholder="Add a note or follow-up…" className="h-9 flex-1 text-sm" required />
              <Button type="submit" variant="ghost" size="sm">Add</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
