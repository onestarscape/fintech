"use client";

import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { RequiredDocumentDef } from "@/types/database";

/** "Paul Baker", "PAN Card" -> "Paul-Baker-PAN-Card" — safe for a storage path segment. */
function slugifyForFilename(text: string) {
  return text
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function DocumentUploader({
  applicationId,
  customerName,
  requiredDocuments,
  uploadedKeys,
}: {
  applicationId: string;
  customerName: string;
  requiredDocuments: RequiredDocumentDef[];
  uploadedKeys: string[];
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>(uploadedKeys);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(doc: RequiredDocumentDef, file: File) {
    setBusyKey(doc.key);
    setError(null);
    const supabase = createClient();

    // File name always defaults to "<Customer Name> <Document Name>", e.g.
    // "Paul Baker PAN Card.pdf" — regardless of what the original file was
    // called on the customer's device — so staff reviewing the documents
    // bucket instantly know whose document and which one they're looking at.
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

    const { error: insertError } = await supabase.from("documents").insert({
      application_id: applicationId,
      doc_key: doc.key,
      label: `${customerName} ${doc.label}`,
      storage_path: path,
    });

    setBusyKey(null);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDone((prev) => [...prev, doc.key]);
  }

  return (
    <div className="space-y-2">
      {requiredDocuments.map((doc) => {
        const isDone = done.includes(doc.key);
        const isBusy = busyKey === doc.key;
        return (
          <label
            key={doc.key}
            className="flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] border border-line px-4 py-3 text-sm hover:bg-black/[0.02]"
          >
            <span className="flex items-center gap-2">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Upload className="h-4 w-4 text-muted" />
              )}
              {doc.label}
              {!doc.required && <span className="text-xs text-muted">(optional)</span>}
            </span>
            <span className="text-xs font-medium text-accent">
              {isBusy ? "Uploading…" : isDone ? "Uploaded — click to replace" : "Upload"}
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
        );
      })}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
