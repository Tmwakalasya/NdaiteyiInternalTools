import Link from "next/link";
import { ArrowRight, FileText, Layers, Newspaper, Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { NewsPost, Profile } from "@/lib/types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { count: memberCount },
    { count: projectCount },
    { count: docCount },
    { count: newsCount },
    { data: latestNews },
    { data: profile },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("news_posts").select("*", { count: "exact", head: true }),
    supabase
      .from("news_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<NewsPost[]>(),
    supabase.from("profiles").select("*").eq("id", user!.id).single<Profile>(),
  ]);

  const isAdmin = profile?.role === "admin";
  const firstName = profile?.full_name?.split(" ")[0];
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const stats = [
    { href: "/members", label: "Members", count: memberCount, icon: Users, accent: true },
    { href: "/projects", label: "Projects", count: projectCount, icon: Layers, accent: false },
    { href: "/documents", label: "Documents", count: docCount, icon: FileText, accent: false },
    { href: "/news", label: "News updates", count: newsCount, icon: Newspaper, accent: false },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="mono-label">{today}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {greeting()}
          {firstName ? (
            <>
              , <span className="emph">{firstName}</span>
            </>
          ) : (
            ""
          )}
        </h1>
        <p className="mt-3 text-muted">
          Here&rsquo;s what&rsquo;s happening in the consortium.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ href, label, count, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className="card group flex flex-col gap-4 p-5 transition hover:border-line-strong"
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                  accent
                    ? "border-accent/15 bg-accent/10 text-accent"
                    : "border-line bg-base text-ink"
                }`}
              >
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <ArrowRight
                size={17}
                className="text-muted transition group-hover:translate-x-1 group-hover:text-ink"
              />
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                {count ?? 0}
              </p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="mono-label mb-2">Quick actions</p>
          <h2 className="text-xl font-semibold tracking-tight">
            Start something
          </h2>
          <p className="mt-1 text-sm text-muted">
            Add a project, upload a document{isAdmin ? ", or post an update" : ""}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/projects/new" className="btn-primary">
            <Plus size={16} /> New project
          </Link>
          <Link href="/documents" className="btn-secondary">
            <Plus size={16} /> Upload document
          </Link>
          {isAdmin && (
            <Link href="/news/new" className="btn-secondary">
              <Plus size={16} /> Post news
            </Link>
          )}
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Latest news</h2>
          <Link
            href="/news"
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        {latestNews && latestNews.length > 0 ? (
          <div className="space-y-3">
            {latestNews.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.id}`}
                className="card block p-5 transition hover:border-line-strong"
              >
                <p className="font-mono text-xs text-muted">
                  {new Date(post.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold tracking-tight">
                  {post.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{post.body}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-sm font-medium">No updates yet</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
              When news is posted for the consortium, it shows up here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
