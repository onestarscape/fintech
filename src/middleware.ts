import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

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

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
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
    (path.startsWith("/admin") ||
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

    if (path.startsWith("/admin") && role !== "admin") {
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
