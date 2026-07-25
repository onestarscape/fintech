import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applyToBecomeBuilder } from "@/lib/actions/builders";

export default async function BecomeBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: builder } = await supabase
    .from("builders")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Register as a builder</h1>
      <p className="mt-1 text-sm text-muted">
        Register your projects and submit bulk home loan requests for your buyers.
      </p>

      {builder ? (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{builder.company_name || "Unnamed company"}</p>
            <Badge tone={builder.status === "approved" ? "success" : builder.status === "suspended" ? "danger" : "warning"}>
              {builder.status}
            </Badge>
          </div>
          {builder.status === "pending" && (
            <p className="mt-4 text-sm text-muted">
              Your application is under review — you&apos;ll get access to the
              builder portal once approved.
            </p>
          )}
          {builder.status === "approved" && (
            <a href="/builder" className="mt-4 inline-block text-sm font-medium text-accent">
              Go to your builder portal →
            </a>
          )}
        </Card>
      ) : (
        <Card className="mt-6 p-6">
          <form action={applyToBecomeBuilder} className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company / developer name</Label>
              <Input id="company_name" name="company_name" required />
            </div>
            <Button type="submit" variant="accent" size="md">
              Submit application
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
