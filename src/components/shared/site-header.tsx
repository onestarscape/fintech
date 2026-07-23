import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          Finlyst
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/80 md:flex">
          <Link href="/#products" className="hover:text-ink">Products</Link>
          <Link href="/about" className="hover:text-ink">About</Link>
          <Link href="/contact" className="hover:text-ink">Contact</Link>
          <Link href="/faqs" className="hover:text-ink">FAQs</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-ink/80 hover:text-ink sm:block">
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "accent", size: "sm" })}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
