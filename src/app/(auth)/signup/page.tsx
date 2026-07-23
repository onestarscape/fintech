import Link from "next/link";
import { signUpWithPassword } from "@/lib/actions/auth";
import { GoogleSignInButton } from "@/components/shared/google-signin-button";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string; ref?: string }>;
}) {
  const { error, check_email, ref } = await searchParams;

  if (check_email) {
    return (
      <div className="text-center">
        <h1 className="font-display text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We&apos;ve sent a confirmation link. Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-xl font-semibold text-center">Create account</h1>
      <p className="mt-1.5 text-center text-sm text-muted">
        Start an application in minutes.
      </p>

      {error && (
        <div className="mt-5 rounded-[var(--radius-sm)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <div className="mt-6">
        <GoogleSignInButton />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form action={signUpWithPassword} className="space-y-4">
        {ref && <input type="hidden" name="referred_by" value={ref} />}
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent">
          Log in
        </Link>
      </p>
    </>
  );
}
