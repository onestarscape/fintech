import { Lock } from "lucide-react";
import { verifyAdminGate } from "@/lib/actions/admin-gate";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function AdminGatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { error, redirect } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-ink text-paper">
            <Lock className="h-5 w-5" strokeWidth={1.75} />
          </span>
        </div>
        <div className="mt-6 rounded-[var(--radius-lg)] border border-line bg-surface p-8">
          <h1 className="font-display text-xl font-semibold text-center">Restricted area</h1>
          <p className="mt-1.5 text-center text-sm text-muted">
            This section is limited to authorized administrators.
          </p>

          {error && (
            <div className="mt-5 rounded-[var(--radius-sm)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={verifyAdminGate} className="mt-6 space-y-4">
            <input type="hidden" name="redirect" value={redirect ?? "/admin"} />
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" variant="accent" size="lg" className="w-full">
              Enter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
