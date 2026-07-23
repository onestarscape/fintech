import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplyFlow } from "@/components/shared/apply-flow";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  return <ApplyFlow product={product} />;
}
