import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MessageThread } from "@/components/shared/message-thread";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: application } = await supabase
    .from("applications")
    .select("id, user_id, products(name)")
    .eq("id", id)
    .single<any>();

  if (!application || application.user_id !== user!.id) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-2xl flex-col">
      <Link href="/dashboard/messages" className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> All threads
      </Link>
      <h1 className="font-display mt-2 text-xl font-semibold tracking-tight">
        {application.products?.name}
      </h1>
      <div className="mt-4 flex-1 overflow-hidden">
        <MessageThread applicationId={id} messages={messages ?? []} currentUserId={user!.id} />
      </div>
    </div>
  );
}
