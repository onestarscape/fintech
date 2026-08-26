import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Supabase free-tier projects automatically pause after 7 days with no
 * API activity. This route does a trivial read (just a row count) so
 * Vercel's scheduled cron job (see vercel.json) can hit it daily and
 * keep the project active indefinitely — no manual visits required.
 *
 * Secured with CRON_SECRET if set (Vercel's documented pattern — it
 * automatically sends this as a Bearer token for cron-triggered
 * requests). If CRON_SECRET isn't set, the check is skipped — this
 * route only ever performs a harmless read, so that's an acceptable
 * default, not a real exposure.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("products").select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
}
