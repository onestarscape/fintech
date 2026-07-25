"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CopyReferralLink({ referralId }: { referralId: string }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Written directly to the input's DOM value (not React state) so this
  // never causes a render-triggering setState-in-effect, and never risks
  // a server/client hydration mismatch on the input's value attribute —
  // the origin (localhost vs the real Vercel domain) is only known client-side.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = `${window.location.origin}/signup?ref=${referralId}`;
    }
  }, [referralId]);

  async function handleCopy() {
    if (!inputRef.current) return;
    await navigator.clipboard.writeText(inputRef.current.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <Input ref={inputRef} defaultValue="" readOnly className="min-w-0 flex-1 font-mono-data text-xs" />
      <Button type="button" variant="outline" size="md" onClick={handleCopy}>
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
