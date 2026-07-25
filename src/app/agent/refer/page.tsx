import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { referCustomer } from "@/lib/actions/agents";

export default async function ReferCustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order");

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Refer a customer</h1>
      <p className="mt-1 text-sm text-muted">
        Enter their details — our team takes it from here.
      </p>

      {error && (
        <div className="mt-4 rounded-[var(--radius-sm)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <Card className="mt-6 p-6">
        <form action={referCustomer} className="space-y-4">
          <div>
            <Label htmlFor="product_id">Product</Label>
            <Select id="product_id" name="product_id" required>
              <option value="" disabled selected>
                Select a product…
              </option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="full_name">Customer full name</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" name="phone" required />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div>
            <Label htmlFor="requirement">Notes (optional)</Label>
            <textarea
              id="requirement"
              name="requirement"
              rows={3}
              className="flex w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
            />
          </div>
          <Button type="submit" variant="accent" size="lg" className="w-full">
            Submit referral
          </Button>
        </form>
      </Card>
    </div>
  );
}
