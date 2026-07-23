import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function MessagesListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, current_stage, products(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<any[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Messages</h1>
      <p className="mt-1 text-sm text-muted">
        Each application has its own thread with your relationship manager.
      </p>

      <div className="mt-6 space-y-2">
        {applications?.map((app) => (
          <Link key={app.id} href={`/dashboard/messages/${app.id}`}>
            <Card className="flex items-center justify-between p-4 hover:shadow-[0_8px_30px_rgba(18,19,26,0.06)]">
              <div>
                <p className="text-sm font-medium">{app.products?.name}</p>
                <p className="mt-0.5 font-mono-data text-xs text-muted">
                  Ref: {app.id.slice(0, 8).toUpperCase()} · {app.current_stage}
                </p>
              </div>
            </Card>
          </Link>
        ))}

        {!applications?.length && (
          <Card className="p-10 text-center">
            <p className="text-sm text-muted">
              Start an application to open a message thread with an RM.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
