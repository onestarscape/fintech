import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // ---------------------------------------------------------------------
  // ADMIN GATE — a separate, dedicated username/password lock in front of
  // /admin, entirely independent of the regular customer/agent/builder
  // account system. Passing this gate does NOT grant any data access by
  // itself (RLS + the profiles.role='admin' check below still fully
  // apply) — it's an extra locked door before anyone even reaches the
  // login form, restricted to whoever is given these exact credentials.
  // ---------------------------------------------------------------------
  const isAdminPath = path === "/admin" || path.startsWith("/admin/");

  if (isAdminPath) {
    const gateCookie = request.cookies.get("admin_gate")?.value;
    const expectedToken = process.env.ADMIN_GATE_TOKEN;

    if (!expectedToken || gateCookie !== expectedToken) {
      const gateUrl = new URL("/admin-gate", request.url);
      gateUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(gateUrl);
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isProtected =
    path.startsWith("/dashboard") ||
    isAdminPath ||
    path.startsWith("/employee") ||
    path.startsWith("/agent") ||
    path.startsWith("/builder");

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Coarse role gate at the edge; RLS does the rest server-side. This just
  // avoids flashing the wrong panel before a redirect.
  if (
    (isAdminPath ||
      path.startsWith("/employee") ||
      path.startsWith("/agent") ||
      path.startsWith("/builder")) &&
    user
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const homeFor: Record<string, string> = {
      employee: "/employee",
      agent: "/agent",
      builder: "/builder",
    };

    if (isAdminPath && role !== "admin") {
      return NextResponse.redirect(new URL(homeFor[role ?? ""] ?? "/dashboard", request.url));
    }

    if (path.startsWith("/employee") && !["admin", "employee"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (path.startsWith("/agent") && !["admin", "agent"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (path.startsWith("/builder") && !["admin", "builder"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
