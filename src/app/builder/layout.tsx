import { redirect } from "next/navigation";
import { LayoutDashboard, Building2, BarChart3, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

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

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const NAV = [
    { label: "Overview", href: "/builder", icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} /> },
    { label: "Projects", href: "/builder/projects", icon: <Building2 className="h-4 w-4" strokeWidth={1.75} /> },
    { label: "Analytics", href: "/builder/analytics", icon: <BarChart3 className="h-4 w-4" strokeWidth={1.75} /> },
    {
      label: "Notifications",
      href: "/builder/notifications",
      icon: <Bell className="h-4 w-4" strokeWidth={1.75} />,
      badge: unreadCount ?? 0,
    },
  ];

  return (
    <DashboardShell navItems={NAV} userLabel={`${user.email} · Builder`} brandHref="/builder">
      {children}
    </DashboardShell>
  );
}
