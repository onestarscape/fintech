import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplyFlow } from "@/components/shared/apply-flow";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Applying (and later uploading documents) requires an account — this
  // keeps every application and document tied to a real, logged-in
  // customer from the start, and avoids orphaned guest applications that
  // can never be reclaimed after the fact.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/apply/${slug}`)}`);
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  return <ApplyFlow product={product} />;
}
