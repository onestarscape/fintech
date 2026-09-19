import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";

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

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let portalHref: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    portalHref = homeForRole(profile?.role);
  }

  return (
    <>
      <SiteHeader portalHref={portalHref} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
