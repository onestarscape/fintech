import { redirect } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Handshake, Building2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

const NAV = [
  { label: "Overview", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Leads", href: "/admin/leads", icon: <Users className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Applications", href: "/admin/applications", icon: <ClipboardList className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Documents", href: "/admin/documents", icon: <FileText className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Agents", href: "/admin/agents", icon: <Handshake className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Builders", href: "/admin/builders", icon: <Building2 className="h-4 w-4" strokeWidth={1.75} /> },
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
