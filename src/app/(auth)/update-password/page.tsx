import { updatePassword } from "@/lib/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <h1 className="font-display text-xl font-semibold text-center">Set new password</h1>

      {error && (
        <div className="mt-5 rounded-[var(--radius-sm)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updatePassword} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full">
          Update password
        </Button>
      </form>
    </>
  );
}
