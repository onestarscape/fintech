import { redirect } from "next/navigation";
import { LayoutDashboard, UserPlus, Users, IndianRupee, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/agent");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "agent"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const NAV = [
    { label: "Overview", href: "/agent", icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} /> },
    { label: "Refer a customer", href: "/agent/refer", icon: <UserPlus className="h-4 w-4" strokeWidth={1.75} /> },
    { label: "My referrals", href: "/agent/referrals", icon: <Users className="h-4 w-4" strokeWidth={1.75} /> },
    { label: "Commissions", href: "/agent/commissions", icon: <IndianRupee className="h-4 w-4" strokeWidth={1.75} /> },
    {
      label: "Notifications",
      href: "/agent/notifications",
      icon: <Bell className="h-4 w-4" strokeWidth={1.75} />,
      badge: unreadCount ?? 0,
    },
  ];

  return (
    <DashboardShell navItems={NAV} userLabel={`${user.email} · Agent`} brandHref="/agent">
      {children}
    </DashboardShell>
  );
}
