import Link from "next/link";
import { signInWithPassword } from "@/lib/actions/auth";
import { GoogleSignInButton } from "@/components/shared/google-signin-button";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm({
  heading,
  subtitle,
  error,
  redirect,
  signupHref = "/signup",
  signupPrompt = "Don't have an account?",
  signupLabel = "Sign up",
}: {
  heading: string;
  subtitle: string;
  error?: string;
  redirect?: string;
  signupHref?: string;
  signupPrompt?: string;
  signupLabel?: string;
}) {
  return (
    <>
      <h1 className="font-display text-xl font-semibold text-center">{heading}</h1>
      <p className="mt-1.5 text-center text-sm text-muted">{subtitle}</p>

      {error && (
        <div className="mt-5 rounded-[var(--radius-sm)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <div className="mt-6">
        <GoogleSignInButton redirectPath={redirect ?? ""} />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form action={signInWithPassword} className="space-y-4">
        <input type="hidden" name="redirect" value={redirect ?? ""} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="mb-1.5 text-xs font-medium text-accent">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {signupPrompt}{" "}
        <Link href={signupHref} className="font-medium text-accent">
          {signupLabel}
        </Link>
      </p>
    </>
  );
}
