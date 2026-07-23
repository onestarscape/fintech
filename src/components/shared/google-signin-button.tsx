"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton({ redirectPath = "/dashboard" }: { redirectPath?: string }) {
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    });
  }

  return (
    <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleClick}>
      Continue with Google
    </Button>
  );
}
