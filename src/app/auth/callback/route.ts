import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  // Google (or Supabase) can redirect back with an error before we even
  // get a code — surface that directly rather than falling through to a
  // generic message.
  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Surface the real reason (e.g. "invalid flow state", "code verifier
    // mismatch") instead of a generic message — this is what actually
    // tells us what's wrong, rather than "Could not authenticate".
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("No authorization code received from provider")}`
  );
}
