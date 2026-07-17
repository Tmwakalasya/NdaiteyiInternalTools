import Link from "next/link";
import { Mail, Newspaper, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import type { NewsPost } from "@/lib/types";

export default async function NewsPage() {
  const supabase = await createClient();
  const { isAdmin } = await getSessionProfile();

  const { data: posts } = await supabase
    .from("news_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<NewsPost[]>();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Newsletter"
        title="News & updates"
        description="Announcements and newsletters for the consortium."
        action={
          isAdmin ? (
            <Link href="/news/new" className="btn-primary">
              <Plus size={16} /> Post an update
            </Link>
          ) : undefined
        }
      />

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.id}`}
              className="card-interactive block p-6 sm:p-7"
            >
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                <span>
                  {new Date(post.created_at).toLocaleDateString("en-GB", {
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
              <h2 className="mt-3 text-xl font-semibold tracking-tight">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                {post.body}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Newspaper}
          title="No news yet"
          description="Updates and announcements will appear here."
          action={
            isAdmin ? (
              <Link href="/news/new" className="btn-primary">
                <Plus size={16} /> Post the first update
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
