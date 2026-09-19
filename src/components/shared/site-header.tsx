"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "https://www.fastuploans.com/services", label: "Products", external: true },
  { href: "/emi-calculator", label: "EMI Calculator", external: false },
  { href: "/about", label: "About", external: true },
  { href: "/contact", label: "Contact", external: true },
  { href: "/faqs", label: "FAQs", external: false },
];

export function SiteHeader({ portalHref }: { portalHref: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Once someone is logged in, nothing in this header should be able to
  // silently bounce them out to the Wix marketing site — that was the
  // original bug. External links (About/Contact/Products, which live on
  // Wix) now open in a new tab so the portal session is never lost, even
  // by an accidental click. `/about`, `/contact` etc also redirect to
  // Wix at the config level (see next.config.ts) — new-tab here is what
  // keeps that safe once someone's actually logged in.
  const isLoggedIn = !!portalHref;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={portalHref ?? "/"}
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <Image src="/fastuploans-logo.png" alt="Fast Up Loans" width={160} height={127} className="h-10 w-auto" priority />
        </Link>

        {isLoggedIn && (
          <Link
            href={portalHref}
            className="hidden items-center gap-1.5 text-sm font-medium text-accent md:flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to my portal
          </Link>
        )}

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/80 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={isLoggedIn && link.external ? "_blank" : undefined}
              rel={isLoggedIn && link.external ? "noopener noreferrer" : undefined}
              className="hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {isLoggedIn ? (
            <Link href={portalHref} className={buttonVariants({ variant: "accent", size: "sm" })}>
              My portal
            </Link>
          ) : (
            <>
              <Link href="/partner-login" className="text-sm font-medium text-ink/60 hover:text-ink">
                Partner login
              </Link>
              <Link href="/login" className="text-sm font-medium text-ink/80 hover:text-ink">
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ variant: "accent", size: "sm" })}>
                Get started
              </Link>
            </>
          )}
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
          {isLoggedIn && (
            <Link
              href={portalHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-2.5 text-sm font-medium text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to my portal
            </Link>
          )}
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={isLoggedIn && link.external ? "_blank" : undefined}
              rel={isLoggedIn && link.external ? "noopener noreferrer" : undefined}
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
            {isLoggedIn ? (
              <Link
                href={portalHref}
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "accent", size: "md" })}
              >
                My portal
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
