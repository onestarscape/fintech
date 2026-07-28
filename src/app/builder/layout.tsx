import { redirect } from "next/navigation";
import { LayoutDashboard, Building2, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

const NAV = [
  { label: "Overview", href: "/builder", icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Projects", href: "/builder/projects", icon: <Building2 className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Analytics", href: "/builder/analytics", icon: <BarChart3 className="h-4 w-4" strokeWidth={1.75} /> },
];

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/builder");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "builder"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell navItems={NAV} userLabel={`${user.email} · Builder`} brandHref="/builder">
      {children}
    </DashboardShell>
  );
}
