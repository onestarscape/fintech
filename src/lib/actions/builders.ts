"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function applyToBecomeBuilder(formData: FormData) {
  const companyName = String(formData.get("company_name") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("builders").insert({
    id: user.id,
    company_name: companyName || null,
  });

  revalidatePath("/dashboard/become-builder");
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const totalUnits = formData.get("total_units") ? Number(formData.get("total_units")) : null;

  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("projects").insert({
    builder_id: user.id,
    name,
    location: location || null,
    total_units: totalUnits,
  });

  revalidatePath("/builder/projects");
}

/**
 * Bulk loan requests — the core builder workflow from the brief. Accepts
 * one buyer per line, comma-separated: "Full Name, Phone, City". Each
 * valid line becomes its own lead row tied to the project, so staff work
 * them exactly like any other lead — just traceable back to the project.
 */
export async function bulkSubmitLeads(formData: FormData) {
  const projectId = String(formData.get("project_id"));
  const productId = String(formData.get("product_id"));
  const raw = String(formData.get("customers") ?? "");

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const rows = lines
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const [full_name, phone, city] = parts;
      if (!full_name || !phone) return null;
      return {
        product_id: productId,
        project_id: projectId,
        full_name,
        phone,
        city: city || null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (!rows.length) {
    redirect(`/builder/projects/${projectId}?error=${encodeURIComponent("No valid rows found — use Name, Phone, City per line")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert(rows);

  if (error) {
    redirect(`/builder/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/builder/projects/${projectId}`);
  redirect(`/builder/projects/${projectId}?submitted=${rows.length}`);
}
