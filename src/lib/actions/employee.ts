"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addFollowUp(formData: FormData) {
  const leadId = String(formData.get("lead_id") ?? "") || null;
  const applicationId = String(formData.get("application_id") ?? "") || null;
  const note = String(formData.get("note") ?? "").trim();
  const dueAt = String(formData.get("due_at") ?? "") || null;

  if (!note) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("follow_ups").insert({
    lead_id: leadId,
    application_id: applicationId,
    assigned_to: user?.id,
    note,
    due_at: dueAt,
    created_by: user?.id,
  });

  revalidatePath("/employee");
  revalidatePath("/employee/leads");
  if (applicationId) revalidatePath(`/employee/applications/${applicationId}`);
}

export async function completeFollowUp(formData: FormData) {
  const id = String(formData.get("follow_up_id"));
  const supabase = await createClient();
  await supabase.from("follow_ups").update({ is_done: true }).eq("id", id);
  revalidatePath("/employee");
  revalidatePath("/employee/leads");
}

export async function claimLead(formData: FormData) {
  const leadId = String(formData.get("lead_id"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("leads")
    .update({ assigned_to: user?.id, status: "contacted" })
    .eq("id", leadId);

  revalidatePath("/employee/leads");
}

export async function updateLeadStatus(formData: FormData) {
  const leadId = String(formData.get("lead_id"));
  const status = String(formData.get("status")) as import("@/types/database").LeadStatus;
  const supabase = await createClient();
  await supabase.from("leads").update({ status }).eq("id", leadId);
  revalidatePath("/employee/leads");
}
