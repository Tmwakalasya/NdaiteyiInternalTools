import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { BackLink } from "@/components/BackLink";
import { NewsForm } from "@/components/NewsForm";
import { PageHeader } from "@/components/PageHeader";
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
    <div className="mx-auto max-w-2xl space-y-8">
      <BackLink href={`/news/${id}`}>Back to update</BackLink>
      <PageHeader eyebrow="Newsletter" title="Edit update" />
      <NewsForm post={post} />
    </div>
  );
}
