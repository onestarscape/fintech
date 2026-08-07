"use client";

import { useMemo, useState } from "react";
import { Upload, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RequiredDocumentDef, DocumentStatus } from "@/types/database";

/** "Paul Baker", "PAN Card" -> "Paul-Baker-PAN-Card" — safe for a storage path segment. */
function slugifyForFilename(text: string) {
  return text
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export interface UploadedDocState {
  doc_key: string;
  status: DocumentStatus;
  rejection_reason: string | null;
}

export function DocumentUploader({
  applicationId,
  customerName,
  requiredDocuments,
  uploadedDocs,
}: {
  applicationId: string;
  customerName: string;
  requiredDocuments: RequiredDocumentDef[];
  uploadedDocs: UploadedDocState[];
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [docs, setDocs] = useState<UploadedDocState[]>(uploadedDocs);
  const [error, setError] = useState<string | null>(null);

  const sections = useMemo(() => {
    const map = new Map<string, RequiredDocumentDef[]>();
    for (const doc of requiredDocuments) {
      const key = doc.section || "Documents";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(doc);
    }
    return Array.from(map.entries());
  }, [requiredDocuments]);

  async function handleUpload(doc: RequiredDocumentDef, file: File) {
    setBusyKey(doc.key);
    setError(null);
    const supabase = createClient();

    const extMatch = file.name.match(/\.[^.]+$/);
    const ext = extMatch ? extMatch[0] : "";
    const niceName = `${slugifyForFilename(customerName) || "Customer"}-${slugifyForFilename(doc.label)}${ext}`;
    const path = `${applicationId}/${doc.key}/${niceName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setBusyKey(null);
      return;
    }

    // Replaces the existing row for this document (if any) rather than
    // creating a duplicate — and resets it back to "pending" review, since
    // a re-upload (e.g. after a rejection) needs to be checked again.
    const { error: upsertError } = await supabase
      .from("documents")
      .upsert(
        {
          application_id: applicationId,
          doc_key: doc.key,
          label: `${customerName} ${doc.label}`,
          storage_path: path,
          status: "pending",
          rejection_reason: null,
        },
        { onConflict: "application_id,doc_key" }
      );

    setBusyKey(null);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setDocs((prev) => [
      ...prev.filter((d) => d.doc_key !== doc.key),
      { doc_key: doc.key, status: "pending", rejection_reason: null },
    ]);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-accent-soft/60 px-3.5 py-2.5 text-xs text-ink/70">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <p>
          Documents are stored encrypted and are only visible to you and
          your assigned relationship manager. They are permanently deleted
          if you delete your account.
        </p>
      </div>

      {sections.map(([section, sectionDocs]) => (
        <div key={section}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {section}
          </p>
          <div className="space-y-2">
            {sectionDocs.map((doc) => {
              const state = docs.find((d) => d.doc_key === doc.key);
              const isBusy = busyKey === doc.key;
              const isRejected = state?.status === "rejected";
              const isVerified = state?.status === "verified";
              const isPending = state?.status === "pending";

              return (
                <div key={doc.key}>
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] border px-4 py-3 text-sm hover:bg-black/[0.02] ${
                      isRejected ? "border-danger/40 bg-danger-soft/40" : "border-line"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isVerified && <CheckCircle2 className="h-4 w-4 text-success" />}
                      {isRejected && <AlertCircle className="h-4 w-4 text-danger" />}
                      {isPending && <CheckCircle2 className="h-4 w-4 text-muted" />}
                      {!state && <Upload className="h-4 w-4 text-muted" />}
                      {doc.label}
                      {!doc.required && <span className="text-xs text-muted">(optional)</span>}
                    </span>
                    <span
                      className={`text-xs font-medium ${isRejected ? "text-danger" : "text-accent"}`}
                    >
                      {isBusy
                        ? "Uploading…"
                        : isVerified
                        ? "Verified"
                        : isRejected
                        ? "Rejected — re-upload"
                        : isPending
                        ? "Uploaded — under review"
                        : "Upload"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      disabled={isBusy}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(doc, file);
                      }}
                    />
                  </label>
                  {isRejected && state?.rejection_reason && (
                    <p className="mt-1.5 px-1 text-xs text-danger">
                      Reason: {state.rejection_reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
