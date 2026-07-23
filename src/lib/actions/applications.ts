"use server";

import { createClient } from "@/lib/supabase/server";
import { leadCaptureSchema, type LeadCaptureInput } from "@/lib/validations/lead";

/**
 * Step 1 of the guided flow for ANY product. Always run before the
 * product-specific fields — a partially-completed lead is still a lead
 * worth having, per the brief's "every lead must be captured" requirement.
 */
export async function createLead(productId: string, input: LeadCaptureInput) {
  const parsed = leadCaptureSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      product_id: productId,
      user_id: user?.id ?? null,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      city: parsed.data.city,
      requirement: parsed.data.requirement || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { lead: data };
}

/**
 * Step 2 — the product-specific fields, defined entirely by
 * product.form_schema. form_data is stored as-is (jsonb); the Dynamic
 * Product Engine never needs a new table or a new server action when a
 * new product is added.
 */
export async function createApplication(
  leadId: string,
  productId: string,
  formData: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("products")
    .select("workflow_stages")
    .eq("id", productId)
    .single();

  const firstStage = (product?.workflow_stages as string[] | undefined)?.[0] ?? "Lead Received";

  const { data, error } = await supabase
    .from("applications")
    .insert({
      lead_id: leadId,
      product_id: productId,
      user_id: user?.id ?? null,
      form_data: formData,
      status: "submitted",
      current_stage: firstStage,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("status_history").insert({
    application_id: data.id,
    status: "submitted",
    stage: firstStage,
    note: "Application submitted by customer.",
  });

  return { application: data };
}
