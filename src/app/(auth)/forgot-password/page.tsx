import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="font-display text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          If an account exists for that address, we&apos;ve sent a reset link.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-xl font-semibold text-center">Reset password</h1>
      <p className="mt-1.5 text-center text-sm text-muted">
        We&apos;ll email you a link to set a new password.
      </p>

      {error && (
        <div className="mt-5 rounded-[var(--radius-sm)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={requestPasswordReset} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-accent">
          Back to log in
        </Link>
      </p>
    </>
  );
}
