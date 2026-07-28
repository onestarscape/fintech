"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logged to the browser console so the message shows up in Vercel's
    // client-side error reporting too, alongside server function logs.
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-lg font-semibold">Something went wrong</p>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono-data text-xs text-muted">Error ref: {error.digest}</p>
      )}
      <Button onClick={() => reset()} variant="accent" size="md" className="mt-6">
        Try again
      </Button>
    </div>
  );
}
