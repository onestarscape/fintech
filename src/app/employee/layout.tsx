import { redirect } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/employee");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "employee"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const NAV = [
    { label: "Overview", href: "/employee", icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} /> },
    { label: "My Leads", href: "/employee/leads", icon: <Users className="h-4 w-4" strokeWidth={1.75} /> },
    { label: "My Applications", href: "/employee/applications", icon: <ClipboardList className="h-4 w-4" strokeWidth={1.75} /> },
    {
      label: "Notifications",
      href: "/employee/notifications",
      icon: <Bell className="h-4 w-4" strokeWidth={1.75} />,
      badge: unreadCount ?? 0,
    },
  ];

  return (
    <DashboardShell navItems={NAV} userLabel={`${user.email} · Employee`} brandHref="/employee">
      {children}
    </DashboardShell>
  );
}
