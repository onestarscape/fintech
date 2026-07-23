"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(formData: FormData) {
  const applicationId = String(formData.get("application_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("messages").insert({
    application_id: applicationId,
    sender_id: user.id,
    body,
  });

  revalidatePath(`/dashboard/messages/${applicationId}`);
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function markNotificationRead(formData: FormData) {
  const id = String(formData.get("notification_id"));
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead(formData: FormData) {
  const userId = String(formData.get("user_id"));
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  revalidatePath("/dashboard/notifications");
}
