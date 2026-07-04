import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { NewsForm } from "@/components/NewsForm";
import type { NewsPost } from "@/lib/types";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect(`/news/${id}`);

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("news_posts")
    .select("*")
    .eq("id", id)
    .single<NewsPost>();

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/news/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to update
      </Link>
      <div>
        <p className="mono-label mb-3">Newsletter</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Edit update
        </h1>
      </div>
      <NewsForm post={post} />
    </div>
  );
}
