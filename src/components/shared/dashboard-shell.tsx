import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function DashboardShell({
  navItems,
  userLabel,
  brandHref,
  children,
}: {
  navItems: NavItem[];
  userLabel: string;
  brandHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="hidden w-64 shrink-0 border-r border-line px-4 py-6 md:flex md:flex-col">
        <Link href={brandHref} className="font-display px-2 text-lg font-semibold">
          Finlyst
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:bg-black/[0.04] hover:text-ink"
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line pt-4">
          <p className="truncate px-2 text-xs text-muted">{userLabel}</p>
          <form action={signOut} className="mt-2">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start px-2">
              Log out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
