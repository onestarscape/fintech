import { redirect } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Handshake, Building2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Applications", href: "/admin/applications", icon: ClipboardList },
  { label: "Documents", href: "/admin/documents", icon: FileText },
  { label: "Agents", href: "/admin/agents", icon: Handshake },
  { label: "Builders", href: "/admin/builders", icon: Building2 },
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

  if (!profile || profile.role !== "admin") {
    redirect(profile?.role === "employee" ? "/employee" : "/dashboard");
  }

  return (
    <DashboardShell navItems={NAV} userLabel={`${user.email} · Admin`} brandHref="/admin">
      {children}
    </DashboardShell>
  );
}
