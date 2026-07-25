"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/database";

export async function updateApplicationStatus(formData: FormData) {
  const applicationId = String(formData.get("application_id"));
  const status = String(formData.get("status")) as ApplicationStatus;
  const stage = String(formData.get("stage") ?? "");
  const note = String(formData.get("note") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("applications")
    .update({ status, current_stage: stage || null })
    .eq("id", applicationId);

  if (!error) {
    await supabase.from("status_history").insert({
      application_id: applicationId,
      status,
      stage: stage || null,
      note: note || null,
      changed_by: user?.id,
    });
  }

  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function assignRelationshipManager(formData: FormData) {
  const applicationId = String(formData.get("application_id"));
  const rmId = String(formData.get("rm_id"));

  const supabase = await createClient();
  await supabase
    .from("applications")
    .update({ assigned_rm_id: rmId || null })
    .eq("id", applicationId);

  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function verifyDocument(formData: FormData) {
  const documentId = String(formData.get("document_id"));
  const applicationId = String(formData.get("application_id"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("documents")
    .update({ verified: true, verified_by: user?.id })
    .eq("id", documentId);

  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function approveAgent(formData: FormData) {
  const agentId = String(formData.get("agent_id"));
  const commissionRate = String(formData.get("commission_rate") ?? "0.50");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("agents")
    .update({
      status: "approved",
      commission_rate: Number(commissionRate),
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", agentId);

  await supabase.from("profiles").update({ role: "agent" }).eq("id", agentId);

  revalidatePath("/admin/agents");
}

export async function suspendAgent(formData: FormData) {
  const agentId = String(formData.get("agent_id"));
  const supabase = await createClient();
  await supabase.from("agents").update({ status: "suspended" }).eq("id", agentId);
  revalidatePath("/admin/agents");
}

export async function logCommission(formData: FormData) {
  const applicationId = String(formData.get("application_id"));
  const agentId = String(formData.get("agent_id"));
  const disbursedAmount = Number(formData.get("disbursed_amount"));
  const rate = Number(formData.get("rate_applied"));
  const commissionAmount = Number(formData.get("commission_amount"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("commissions").insert({
    application_id: applicationId,
    agent_id: agentId,
    disbursed_amount: disbursedAmount || null,
    rate_applied: rate || null,
    commission_amount: commissionAmount,
    created_by: user?.id,
  });

  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function markCommissionPaid(formData: FormData) {
  const commissionId = String(formData.get("commission_id"));
  const supabase = await createClient();
  await supabase
    .from("commissions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", commissionId);
  revalidatePath("/admin/agents");
}

export async function approveBuilder(formData: FormData) {
  const builderId = String(formData.get("builder_id"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("builders")
    .update({ status: "approved", approved_by: user?.id, approved_at: new Date().toISOString() })
    .eq("id", builderId);

  await supabase.from("profiles").update({ role: "builder" }).eq("id", builderId);

  revalidatePath("/admin/builders");
}

export async function suspendBuilder(formData: FormData) {
  const builderId = String(formData.get("builder_id"));
  const supabase = await createClient();
  await supabase.from("builders").update({ status: "suspended" }).eq("id", builderId);
  revalidatePath("/admin/builders");
}
