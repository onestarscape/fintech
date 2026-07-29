import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/actions/profile";
import { DeleteAccountForm } from "@/components/shared/delete-account-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted">Keep your details up to date.</p>

      <Card className="mt-6 p-6">
        <form action={updateProfile} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
            <p className="mt-1 text-xs text-muted">Email is managed by your login provider.</p>
          </div>
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={profile?.city ?? ""} />
          </div>
          <Button type="submit" variant="accent" size="md">
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="mt-6 border-danger/30 p-6">
        <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
        <p className="mt-1.5 text-sm text-muted">
          Permanently deletes your account, applications, and every
          document you&apos;ve uploaded — including the actual files, not
          just the records. This cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteAccountForm />
        </div>
      </Card>
    </div>
  );
}
