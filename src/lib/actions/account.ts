"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Full account deletion, triggered by the customer themselves from their
 * Profile page. This is what makes the "documents are deleted when you
 * delete your account" notice (shown throughout the document upload UI)
 * an actual guarantee rather than just copy:
 *
 *  1. Every document this user ever uploaded is removed from Storage
 *     (deleting the database row alone does NOT delete the underlying
 *     file — Postgres FK cascades never touch Storage objects).
 *  2. Their applications (which cascades documents/messages/status
 *     history rows) and leads are deleted.
 *  3. The auth user itself is deleted (cascades their profile, and any
 *     agent/builder record).
 *
 * Uses the service-role admin client because deleting another table's
 * Storage objects and the auth user both require elevated privileges no
 * customer session has — but every operation here is scoped strictly to
 * the currently logged-in user's own id, never anyone else's.
 */
export async function deleteMyAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: apps } = await admin
    .from("applications")
    .select("id")
    .eq("user_id", user.id);
  const appIds = (apps ?? []).map((a) => a.id);

  if (appIds.length) {
    const { data: docs } = await admin
      .from("documents")
      .select("storage_path")
      .in("application_id", appIds);

    const paths = (docs ?? []).map((d) => d.storage_path);
    if (paths.length) {
      await admin.storage.from("documents").remove(paths);
    }

    // Cascades documents, status_history, and messages rows for these
    // applications (all declared ON DELETE CASCADE against applications).
    await admin.from("applications").delete().in("id", appIds);
  }

  await admin.from("leads").delete().eq("user_id", user.id);

  // Cascades the profiles row, and any agents/builders row tied to it.
  await admin.auth.admin.deleteUser(user.id);

  await supabase.auth.signOut();
  redirect("/");
}
