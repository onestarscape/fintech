import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: documents } = await supabase
    .from("documents")
    .select("*, applications!inner(id, user_id, products(name))")
    .eq("applications.user_id", user!.id)
    .order("uploaded_at", { ascending: false })
    .returns<any[]>();

  // Signed URLs — the bucket is private, every link is short-lived
  // rather than a permanent public one.
  const withUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.storage_path, 60 * 10);
      return { ...doc, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Documents</h1>
      <p className="mt-1 text-sm text-muted">
        Every document you&apos;ve uploaded, across all your applications, in one place.
      </p>

      <div className="mt-6 space-y-2">
        {withUrls.map((doc) => (
          <Card key={doc.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{doc.label}</p>
              <p className="mt-0.5 text-xs text-muted">
                {doc.applications?.products?.name} ·{" "}
                {new Date(doc.uploaded_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {doc.status === "rejected" && doc.rejection_reason && (
                <p className="mt-1 text-xs text-danger">Reason: {doc.rejection_reason}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge
                tone={doc.status === "verified" ? "success" : doc.status === "rejected" ? "danger" : "warning"}
              >
                {doc.status === "verified" ? "Verified" : doc.status === "rejected" ? "Rejected" : "Under review"}
              </Badge>
              {doc.signedUrl && (
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-accent whitespace-nowrap"
                >
                  View
                </a>
              )}
              <Link
                href={`/dashboard/applications/${doc.applications?.id}`}
                className="text-xs text-muted hover:text-ink whitespace-nowrap"
              >
                View app
              </Link>
            </div>
          </Card>
        ))}

        {!withUrls.length && (
          <Card className="p-10 text-center">
            <p className="text-sm text-muted">
              No documents uploaded yet — they&apos;ll show up here once you upload some
              from an application.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
