import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Image src="/fastuploans-logo.png" alt="Fast Up Loans" width={140} height={111} className="h-11 w-auto" />
            <p className="mt-2 text-sm text-muted">Loans made simple.</p>
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
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Fast Up Loans. Fast Up Loans is a lead-generation and
            application-facilitation platform; loans, insurance, and accounts are
            issued solely by our partner banks, NBFCs, and insurers, subject to
            their approval.
          </p>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted">
            <span>Powered by</span>
            <Image src="/starscape-logo.png" alt="Starscape" width={72} height={38} className="opacity-70" />
          </div>
        </div>
      </div>
    </footer>
  );
}
