"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faqs", label: "FAQs" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight" onClick={() => setOpen(false)}>
          Finlyst
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/80 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/partner-login" className="text-sm font-medium text-ink/60 hover:text-ink">
            Partner login
          </Link>
          <Link href="/login" className="text-sm font-medium text-ink/80 hover:text-ink">
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "accent", size: "sm" })}>
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-ink md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        className={cn(
          "overflow-hidden border-t border-line/70 transition-[max-height] duration-200 ease-in-out md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-[var(--radius-sm)] px-2 py-2.5 text-sm font-medium",
                pathname === link.href ? "text-accent" : "text-ink/80"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius-sm)] px-2 py-2.5 text-sm font-medium text-ink/80"
            >
              Log in
            </Link>
            <Link
              href="/partner-login"
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius-sm)] px-2 py-2.5 text-sm font-medium text-ink/60"
            >
              Partner login
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: "accent", size: "md" })}
            >
              Get started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
