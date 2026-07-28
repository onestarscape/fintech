import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Where each role lands by default when no specific page was requested. */
function homeForRole(role: string | undefined) {
  switch (role) {
    case "admin":
      return "/admin";
    case "employee":
      return "/employee";
    case "agent":
      return "/agent";
    case "builder":
      return "/builder";
    default:
      return "/dashboard";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Empty means "no specific page was requested" (see the login/partner
  // login pages) — in that case each role gets sent to its own home
  // rather than always defaulting to the customer dashboard.
  const next = searchParams.get("next") ?? "";
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  // Google (or Supabase) can redirect back with an error before we even
  // get a code — surface that directly rather than falling through to a
  // generic message.
  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      return NextResponse.redirect(`${origin}${homeForRole(profile?.role)}`);
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
