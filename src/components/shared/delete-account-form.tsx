"use client";

import { useState } from "react";
import { deleteMyAccount } from "@/lib/actions/account";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DeleteAccountForm() {
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  return (
    <form
      action={async () => {
        setSubmitting(true);
        await deleteMyAccount();
      }}
      className="space-y-3"
    >
      <div>
        <Label htmlFor="confirm_delete">
          Type <span className="font-mono-data">DELETE</span> to confirm
        </Label>
        <Input
          id="confirm_delete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        size="md"
        disabled={!canDelete || submitting}
        className="border-danger text-danger hover:bg-danger-soft"
      >
        {submitting ? "Deleting…" : "Permanently delete my account"}
      </Button>
    </form>
  );
}
