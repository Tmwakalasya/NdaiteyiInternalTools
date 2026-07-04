import Link from "next/link";
import { Mail, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label mb-3">Newsletter</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            News &amp; updates
          </h1>
          <p className="mt-3 text-muted">
            Announcements and newsletters for the consortium
          </p>
        </div>
        {isAdmin && (
          <Link href="/news/new" className="btn-primary">
            <Plus size={16} /> Post an update
          </Link>
        )}
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.id}`}
              className="card block p-6 transition hover:border-line-strong"
            >
              <div className="flex items-center gap-3 font-mono text-xs text-muted">
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
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {post.title}
              </h2>
              <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">
                {post.body}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-muted">
          No news yet.{" "}
          {isAdmin && (
            <Link
              href="/news/new"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Post the first update
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
