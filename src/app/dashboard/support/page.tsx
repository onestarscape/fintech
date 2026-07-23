import Link from "next/link";
import { LifeBuoy, MessageCircle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Support</h1>
      <p className="mt-1 text-sm text-muted">
        Have a question about a specific application? Message your relationship
        manager directly from that application&apos;s page — it&apos;s faster.
      </p>

      <div className="mt-6 space-y-3">
        <Link href="/dashboard/messages">
          <Card className="flex items-center gap-4 p-5 hover:shadow-[0_8px_30px_rgba(18,19,26,0.06)]">
            <MessageCircle className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium">Message your relationship manager</p>
              <p className="text-xs text-muted">Fastest way to get an answer on an application</p>
            </div>
          </Card>
        </Link>
        <Link href="/faqs">
          <Card className="flex items-center gap-4 p-5 hover:shadow-[0_8px_30px_rgba(18,19,26,0.06)]">
            <HelpCircle className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium">Browse FAQs</p>
              <p className="text-xs text-muted">Common questions about applications and documents</p>
            </div>
          </Card>
        </Link>
        <Link href="/contact">
          <Card className="flex items-center gap-4 p-5 hover:shadow-[0_8px_30px_rgba(18,19,26,0.06)]">
            <LifeBuoy className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium">General contact</p>
              <p className="text-xs text-muted">For anything not tied to a specific application</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
