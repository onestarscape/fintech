import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold">Finlyst</p>
            <p className="mt-2 text-sm text-muted">Finance, made simple.</p>
          </div>
          <div>
            <p className="text-sm font-medium">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/about" className="hover:text-ink">About</Link></li>
              <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Products</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/products/home-loan" className="hover:text-ink">Home Loan</Link></li>
              <li><Link href="/products/personal-loan" className="hover:text-ink">Personal Loan</Link></li>
              <li><Link href="/products/business-loan" className="hover:text-ink">Business Loan</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/privacy" className="hover:text-ink">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ink">Terms &amp; Conditions</Link></li>
              <li><Link href="/faqs" className="hover:text-ink">FAQs</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted">
          © {new Date().getFullYear()} Finlyst. Finlyst is a lead-generation and
          application-facilitation platform; loans, insurance, and accounts are
          issued solely by our partner banks, NBFCs, and insurers, subject to
          their approval.
        </p>
      </div>
    </footer>
  );
}
