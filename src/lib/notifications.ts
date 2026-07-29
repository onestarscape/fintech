import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Creates a notification row for a user. Every meaningful event a
 * customer, agent, or builder cares about — status change, RM assigned,
 * document verified, message received, approval granted, commission
 * logged — should call this. Silently no-ops if userId is null (e.g. a
 * guest-adjacent record with no linked account), since there's no one to
 * notify.
 */
export async function notifyUser(
  supabase: SupabaseClient<Database>,
  userId: string | null | undefined,
  title: string,
  message?: string,
  link?: string
) {
  if (!userId) return;
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message: message ?? null,
    link: link ?? null,
  });
}
