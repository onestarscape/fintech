import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { CopyReferralLink } from "@/components/shared/copy-referral-link";

export default async function ReferralPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: referredCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("referred_by", user!.id);

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Refer &amp; earn</h1>
      <p className="mt-1 text-sm text-muted">
        Share your link — anyone who signs up through it is linked to your account.
      </p>

      <Card className="mt-6 p-6">
        <p className="text-sm font-medium">Your referral link</p>
        <div className="mt-3">
          <CopyReferralLink referralId={user!.id} />
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <p className="text-sm text-muted">People referred by you</p>
        <p className="font-display mt-1 text-3xl font-semibold">{referredCount ?? 0}</p>
      </Card>

      <p className="mt-4 text-xs text-muted">
        Rewards and payouts for referrals will be introduced once the
        payment gateway is live (Phase 2) — for now this tracks who joined
        through your link.
      </p>
    </div>
  );
}
