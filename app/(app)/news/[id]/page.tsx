import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { NewsAdminActions } from "@/components/NewsAdminActions";
import type { NewsPost } from "@/lib/types";

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { isAdmin } = await getSessionProfile();

  const { data: post } = await supabase
    .from("news_posts")
    .select("*")
    .eq("id", id)
    .single<NewsPost>();

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} /> All news
        </Link>
        {isAdmin && <NewsAdminActions post={post} />}
      </div>

      <article className="card p-6 sm:p-10">
        <div className="flex items-center gap-3 font-mono text-xs text-muted">
          <span>
            {new Date(post.created_at).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          {post.emailed_at && (
            <span className="badge">
              <Mail size={11} /> Emailed to members
            </span>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink/80">
          {post.body.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
