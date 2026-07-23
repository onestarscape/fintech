import { redirect } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Applications", href: "/admin/applications", icon: ClipboardList },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "employee"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell navItems={NAV} userLabel={`${user.email} · Admin`} brandHref="/admin">
      {children}
    </DashboardShell>
  );
}
