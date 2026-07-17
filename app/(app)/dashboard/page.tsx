import Link from "next/link";
import { FileText, Layers, Newspaper, Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { site } from "@/lib/config";
import type { NewsPost, Profile, Project } from "@/lib/types";

type ProjectWithStages = Project & {
  project_stages: { completed: boolean }[];
};

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
    { data: activeProjects },
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
    supabase
      .from("projects")
      .select("*, project_stages(completed)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<ProjectWithStages[]>(),
  ]);

  const isAdmin = profile?.role === "admin";
  const firstName = profile?.full_name?.split(" ")[0];
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const members = memberCount ?? 0;
  const projects = projectCount ?? 0;
  const docs = docCount ?? 0;
  const news = newsCount ?? 0;

  const stats = [
    {
      href: "/members",
      label: "Members",
      count: members,
      detail: members === 1 ? "1 registered" : `${members} registered`,
      icon: Users,
      variant: "indigo" as const,
    },
    {
      href: "/projects",
      label: "Projects",
      count: projects,
      detail: projects === 1 ? "1 transaction" : `${projects} transactions`,
      icon: Layers,
      variant: "violet" as const,
    },
    {
      href: "/documents",
      label: "Documents",
      count: docs,
      detail: docs === 1 ? "1 file shared" : `${docs} files shared`,
      icon: FileText,
      variant: "slate" as const,
    },
    {
      href: "/news",
      label: "News updates",
      count: news,
      detail: news === 1 ? "1 post" : `${news} posts`,
      icon: Newspaper,
      variant: "rose" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="hero-band">
        <div className="relative z-[1]">
          <p className="section-label">{today}</p>
          <h1 className="display-title mt-2 text-3xl sm:text-4xl">
            {greeting()}
            {firstName ? (
              <>
                , <span className="emph">{firstName}</span>
              </>
            ) : (
              ""
            )}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {site.name} — {site.tagline}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/projects/new" className="btn-primary">
              <Plus size={15} /> New project
            </Link>
            <Link href="/documents" className="btn-secondary">
              <Plus size={15} /> Upload document
            </Link>
            {isAdmin && (
              <Link href="/news/new" className="btn-secondary">
                <Plus size={15} /> Post news
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.href} {...stat} />
        ))}
      </div>

      {activeProjects && activeProjects.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="section-label mb-1">Transactions</p>
              <h2 className="text-xl font-semibold tracking-tight">
                Active projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {activeProjects.map((project) => {
              const stages = project.project_stages ?? [];
              const total = stages.length;
              const done = stages.filter((s) => s.completed).length;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="card-interactive block p-5"
                >
                  <h3 className="font-semibold tracking-tight">{project.name}</h3>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-muted">
                      <span>
                        {done}/{total} phases
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="section-label mb-1">Newsletter</p>
            <h2 className="text-xl font-semibold tracking-tight">Latest news</h2>
          </div>
          <Link
            href="/news"
            className="text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
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
                className="card-interactive block p-5 sm:p-6"
              >
                <p className="text-xs text-muted">
                  {new Date(post.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                  {post.body}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Newspaper}
            title="No updates yet"
            description="When news is posted for the consortium, it shows up here."
            action={
              isAdmin ? (
                <Link href="/news/new" className="btn-primary">
                  <Plus size={16} /> Post the first update
                </Link>
              ) : undefined
            }
          />
        )}
      </section>
    </div>
  );
}
