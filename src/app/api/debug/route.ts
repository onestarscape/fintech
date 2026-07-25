import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * TEMPORARY diagnostic route — delete this file once the products/partners
 * empty-state issue is confirmed fixed. Returns exactly what the server
 * gets back from Supabase, including any error object, so the real cause
 * (bad env var, RLS, wrong project, etc.) is visible instead of guessed at.
 */
export async function GET() {
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 12) + "..."
      : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY_SET: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  try {
    const supabase = await createClient();
    const productsResult = await supabase.from("products").select("*");
    const partnersResult = await supabase.from("partners").select("*");

    return NextResponse.json({
      env: envCheck,
      products: {
        count: productsResult.data?.length ?? 0,
        error: productsResult.error,
        sample: productsResult.data?.[0] ?? null,
      },
      partners: {
        count: partnersResult.data?.length ?? 0,
        error: partnersResult.error,
      },
    });
  } catch (err) {
    return NextResponse.json({
      env: envCheck,
      caughtError: err instanceof Error ? err.message : String(err),
    });
  }
}
