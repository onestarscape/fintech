"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

function NavLinks({ navItems, onNavigate }: { navItems: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="mt-8 flex-1 space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/[0.04] hover:text-ink",
              active ? "bg-accent-soft text-accent" : "text-ink/80"
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer automatically on route change — adjusted
  // during render (React's recommended pattern for this), not in an
  // effect, since that would cause an extra cascading render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop sidebar — unchanged */}
      <aside className="hidden w-64 shrink-0 border-r border-line px-4 py-6 md:flex md:flex-col">
        <Link href={brandHref} className="font-display px-2 text-lg font-semibold">
          Finlyst
        </Link>
        <NavLinks navItems={navItems} />
        <div className="border-t border-line pt-4">
          <p className="truncate px-2 text-xs text-muted">{userLabel}</p>
          <form action={signOut} className="mt-2">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start px-2">
              Log out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur md:hidden">
        <Link href={brandHref} className="font-display text-base font-semibold">
          Finlyst
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-ink"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-line bg-paper px-4 pb-6 pt-20 shadow-xl">
            <NavLinks navItems={navItems} onNavigate={() => setOpen(false)} />
            <div className="border-t border-line pt-4">
              <p className="truncate px-2 text-xs text-muted">{userLabel}</p>
              <form action={signOut} className="mt-2">
                <Button type="submit" variant="ghost" size="sm" className="w-full justify-start px-2">
                  Log out
                </Button>
              </form>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 px-6 py-8 pt-20 md:px-10 md:py-10 md:pt-10">{children}</main>
    </div>
  );
}
