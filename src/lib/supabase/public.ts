import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * For PUBLIC, RLS-open data only (active products, active partners) that
 * we want to cache across requests with unstable_cache. Deliberately has
 * no cookie/session handling — Next.js disallows dynamic APIs like
 * cookies() inside a cached function, and public marketing data doesn't
 * need a session to read anyway (RLS already allows anon SELECT on
 * is_active = true rows).
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
