import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { verifyDocument, rejectDocument } from "@/lib/actions/admin";

export default async function AdminDocumentsPage() {
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("*, applications(id, products(name), leads(full_name))")
    .order("uploaded_at", { ascending: false })
    .returns<any[]>();

  // Signed URLs — the bucket is private, so every download link is
  // short-lived rather than a permanent public URL. Generated per row;
  // fine at this volume, revisit with pagination if it ever gets slow.
  const withUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.storage_path, 60 * 10); // 10 minutes
      return { ...doc, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Documents</h1>
      <p className="mt-1 text-sm text-muted">
        Every document uploaded across all applications. Download links expire after 10 minutes.
      </p>

      <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b border-line bg-black/[0.02] text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {withUrls.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4 py-3 font-medium">
                    {doc.applications?.leads?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {doc.label}
                    {doc.status === "rejected" && doc.rejection_reason && (
                      <p className="mt-0.5 text-xs text-danger">Reason: {doc.rejection_reason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{doc.applications?.products?.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(doc.uploaded_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        doc.status === "verified" ? "success" : doc.status === "rejected" ? "danger" : "warning"
                      }
                    >
                      {doc.status === "verified" ? "Verified" : doc.status === "rejected" ? "Rejected" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {doc.signedUrl && (
                        <a
                          href={doc.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-accent"
                        >
                          Download
                        </a>
                      )}
                      {doc.status === "pending" && (
                        <>
                          <form action={verifyDocument}>
                            <input type="hidden" name="document_id" value={doc.id} />
                            <input type="hidden" name="application_id" value={doc.applications?.id} />
                            <button type="submit" className="text-xs font-medium text-success">
                              Verify
                            </button>
                          </form>
                          <form action={rejectDocument} className="flex items-center gap-1">
                            <input type="hidden" name="document_id" value={doc.id} />
                            <input type="hidden" name="application_id" value={doc.applications?.id} />
                            <input
                              type="text"
                              name="reason"
                              required
                              placeholder="Reason…"
                              className="h-7 w-28 rounded-[var(--radius-sm)] border border-line bg-surface px-2 text-xs placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                            />
                            <button type="submit" className="text-xs font-medium text-danger">
                              Reject
                            </button>
                          </form>
                        </>
                      )}
                      <Link
                        href={`/admin/applications/${doc.applications?.id}`}
                        className="text-xs text-muted hover:text-ink"
                      >
                        View app
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!withUrls.length && (
          <p className="p-6 text-center text-sm text-muted">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
