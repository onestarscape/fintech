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
