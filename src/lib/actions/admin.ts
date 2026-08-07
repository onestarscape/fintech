"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyUser } from "@/lib/notifications";
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

  const { data: application, error } = await supabase
    .from("applications")
    .update({ status, current_stage: stage || null })
    .eq("id", applicationId)
    .select("user_id, products(name)")
    .single<any>();

  if (!error) {
    await supabase.from("status_history").insert({
      application_id: applicationId,
      status,
      stage: stage || null,
      note: note || null,
      changed_by: user?.id,
    });

    await notifyUser(
      supabase,
      application?.user_id,
      `${application?.products?.name ?? "Your application"} — status updated`,
      `Now: ${status.replace(/_/g, " ")}${stage ? ` · ${stage}` : ""}`,
      `/dashboard/applications/${applicationId}`
    );
  }

  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function assignRelationshipManager(formData: FormData) {
  const applicationId = String(formData.get("application_id"));
  const rmId = String(formData.get("rm_id"));

  const supabase = await createClient();
  const { data: application } = await supabase
    .from("applications")
    .update({ assigned_rm_id: rmId || null })
    .eq("id", applicationId)
    .select("user_id, products(name)")
    .single<any>();

  if (rmId) {
    await notifyUser(
      supabase,
      application?.user_id,
      `A relationship manager has been assigned`,
      `Your ${application?.products?.name ?? "application"} now has a dedicated point of contact.`,
      `/dashboard/applications/${applicationId}`
    );
  }

  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function verifyDocument(formData: FormData) {
  const documentId = String(formData.get("document_id"));
  const applicationId = String(formData.get("application_id"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: document } = await supabase
    .from("documents")
    .update({ status: "verified", rejection_reason: null, verified_by: user?.id })
    .eq("id", documentId)
    .select("label, applications(user_id)")
    .single<any>();

  await notifyUser(
    supabase,
    document?.applications?.user_id,
    "Document verified",
    `${document?.label ?? "Your document"} has been verified.`,
    `/dashboard/applications/${applicationId}`
  );

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/documents");
}

export async function rejectDocument(formData: FormData) {
  const documentId = String(formData.get("document_id"));
  const applicationId = String(formData.get("application_id"));
  const reason = String(formData.get("reason") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: document } = await supabase
    .from("documents")
    .update({
      status: "rejected",
      rejection_reason: reason || "No reason provided — please contact support.",
      verified_by: user?.id,
    })
    .eq("id", documentId)
    .select("label, applications(user_id)")
    .single<any>();

  await notifyUser(
    supabase,
    document?.applications?.user_id,
    "Document needs attention",
    `${document?.label ?? "A document"} was rejected: ${reason || "please re-upload."}`,
    `/dashboard/applications/${applicationId}`
  );

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/documents");
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

  await notifyUser(
    supabase,
    agentId,
    "You're approved as an agent",
    `Your commission rate is set at ${commissionRate}%. Start referring customers from your agent portal.`,
    "/agent"
  );

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

  await notifyUser(
    supabase,
    agentId,
    "Commission logged",
    `₹${commissionAmount.toLocaleString("en-IN")} commission logged for a disbursed application.`,
    "/agent/commissions"
  );

  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function markCommissionPaid(formData: FormData) {
  const commissionId = String(formData.get("commission_id"));
  const supabase = await createClient();

  const { data: commission } = await supabase
    .from("commissions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", commissionId)
    .select("agent_id, commission_amount")
    .single();

  await notifyUser(
    supabase,
    commission?.agent_id,
    "Commission paid",
    `₹${Number(commission?.commission_amount ?? 0).toLocaleString("en-IN")} has been marked as paid.`,
    "/agent/commissions"
  );

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

  await notifyUser(
    supabase,
    builderId,
    "You're approved as a builder partner",
    "Register your projects and start submitting bulk loan requests from your builder portal.",
    "/builder"
  );

  revalidatePath("/admin/builders");
}

export async function suspendBuilder(formData: FormData) {
  const builderId = String(formData.get("builder_id"));
  const supabase = await createClient();
  await supabase.from("builders").update({ status: "suspended" }).eq("id", builderId);
  revalidatePath("/admin/builders");
}
