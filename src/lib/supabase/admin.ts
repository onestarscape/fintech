import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * SERVER-ONLY. Uses the service role key and bypasses RLS.
 * Never import this into a Client Component or expose it to the browser.
 * Reserved for trusted server-side operations (e.g. admin bulk actions,
 * future Zoho sync jobs, signed URL generation for staff tooling).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
