"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { leadCaptureSchema } from "@/lib/validations/lead";

export async function applyToBecomeAgent(formData: FormData) {
  const agencyName = String(formData.get("agency_name") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("agents").insert({
    id: user.id,
    agency_name: agencyName || null,
  });

  revalidatePath("/dashboard/agent");
}

export async function referCustomer(formData: FormData) {
  const productId = String(formData.get("product_id"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const parsed = leadCaptureSchema.safeParse({
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    city: String(formData.get("city") ?? ""),
    requirement: String(formData.get("requirement") ?? ""),
  });

  if (!parsed.success) {
    redirect(`/agent/refer?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`);
  }

  await supabase.from("leads").insert({
    product_id: productId,
    agent_id: user.id,
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    city: parsed.data.city,
    requirement: parsed.data.requirement || null,
  });

  revalidatePath("/agent");
  revalidatePath("/agent/referrals");
  redirect("/agent/referrals?submitted=1");
}
