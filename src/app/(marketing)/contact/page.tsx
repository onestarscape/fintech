import { ContentPage } from "@/components/shared/content-page";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <ContentPage eyebrow="Contact" title="Talk to us">
      <p>
        Have a question about a product or an existing application? Reach
        out — a real person will respond, not a ticket queue.
      </p>
      <form className="!mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="flex w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
          />
        </div>
        <Button type="submit" variant="accent">
          Send message
        </Button>
        <p className="text-xs text-muted">
          This form is a UI placeholder for Phase 0 — wire it to a Supabase
          table or an email API (e.g. Resend) in Phase 1.
        </p>
      </form>
    </ContentPage>
  );
}
