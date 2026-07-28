import { redirect } from "next/navigation";
import { LayoutGrid, FileText, MessageSquare, Bell, User, LifeBuoy, Gift, Briefcase, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

const NAV = [
  { label: "Applications", href: "/dashboard", icon: <LayoutGrid className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Documents", href: "/dashboard/documents", icon: <FileText className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Messages", href: "/dashboard/messages", icon: <MessageSquare className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Notifications", href: "/dashboard/notifications", icon: <Bell className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Profile", href: "/dashboard/profile", icon: <User className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Support", href: "/dashboard/support", icon: <LifeBuoy className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Refer & earn", href: "/dashboard/referral", icon: <Gift className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Become an agent", href: "/dashboard/become-agent", icon: <Briefcase className="h-4 w-4" strokeWidth={1.75} /> },
  { label: "Register as builder", href: "/dashboard/become-builder", icon: <Building2 className="h-4 w-4" strokeWidth={1.75} /> },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  return (
    <DashboardShell navItems={NAV} userLabel={user.email ?? ""} brandHref="/dashboard">
      {children}
    </DashboardShell>
  );
}
