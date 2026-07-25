import { redirect } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

const NAV = [
  { label: "Overview", href: "/employee", icon: LayoutDashboard },
  { label: "My Leads", href: "/employee/leads", icon: Users },
  { label: "My Applications", href: "/employee/applications", icon: ClipboardList },
];

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

  return (
    <DashboardShell navItems={NAV} userLabel={`${user.email} · Employee`} brandHref="/employee">
      {children}
    </DashboardShell>
  );
}
