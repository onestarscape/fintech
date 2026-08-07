"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RequiredDocumentDef, DocumentStatus } from "@/types/database";

interface DocRow {
  id: string;
  doc_key: string;
  status: DocumentStatus;
  rejection_reason: string | null;
}

export function DocumentReviewList({
  requiredDocuments,
  documents,
  applicationId,
  verifyAction,
  rejectAction,
}: {
  requiredDocuments: RequiredDocumentDef[];
  documents: DocRow[] | null | undefined;
  applicationId: string;
  verifyAction: (formData: FormData) => void;
  rejectAction: (formData: FormData) => void;
}) {
  const [rejectingKey, setRejectingKey] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {requiredDocuments.map((doc) => {
        const uploaded = documents?.find((d) => d.doc_key === doc.key);
        const isRejecting = rejectingKey === doc.key;

        return (
          <div key={doc.key} className="rounded-[var(--radius-sm)] border border-line px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span>{doc.label}</span>
              {!uploaded ? (
                <span className="text-xs text-muted">Not uploaded</span>
              ) : uploaded.status === "verified" ? (
                <Badge tone="success">Verified</Badge>
              ) : uploaded.status === "rejected" ? (
                <Badge tone="danger">Rejected</Badge>
              ) : (
                <div className="flex items-center gap-3">
                  <form action={verifyAction}>
                    <input type="hidden" name="document_id" value={uploaded.id} />
                    <input type="hidden" name="application_id" value={applicationId} />
                    <button type="submit" className="text-xs font-medium text-success">
                      Verify
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => setRejectingKey(isRejecting ? null : doc.key)}
                    className="text-xs font-medium text-danger"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

            {uploaded?.status === "rejected" && uploaded.rejection_reason && (
              <p className="mt-1.5 text-xs text-danger">Reason given: {uploaded.rejection_reason}</p>
            )}

            {isRejecting && uploaded && (
              <form
                action={(formData) => {
                  rejectAction(formData);
                  setRejectingKey(null);
                }}
                className="mt-2 flex gap-2"
              >
                <input type="hidden" name="document_id" value={uploaded.id} />
                <input type="hidden" name="application_id" value={applicationId} />
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="Reason the customer will see…"
                  className="h-8 flex-1 rounded-[var(--radius-sm)] border border-line bg-surface px-2.5 text-xs placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                />
                <Button type="submit" variant="outline" size="sm" className="border-danger text-danger">
                  Send
                </Button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
