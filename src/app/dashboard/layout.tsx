import { redirect } from "next/navigation";
import { LayoutGrid, FileText, MessageSquare, Bell, User, LifeBuoy, Gift, Briefcase, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/shared/dashboard-shell";

const NAV = [
  { label: "Applications", href: "/dashboard", icon: LayoutGrid },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
  { label: "Refer & earn", href: "/dashboard/referral", icon: Gift },
  { label: "Become an agent", href: "/dashboard/become-agent", icon: Briefcase },
  { label: "Register as builder", href: "/dashboard/become-builder", icon: Building2 },
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
