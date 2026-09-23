import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Layers,
  Newspaper,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "@/components/ActivityFeed";
import { EmptyState } from "@/components/EmptyState";
import { PriceTicker } from "@/components/PriceTicker";
import { getMetalPrices } from "@/lib/prices";
import {
  complianceSummary,
  getComplianceOverview,
} from "@/lib/compliance";
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
    { data: recentMembers },
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
    supabase
      .from("members")
      .select("id, full_name, photo_url")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const isAdmin = profile?.role === "admin";
  const firstName = profile?.full_name?.split(" ")[0];
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const compliance = isAdmin
    ? complianceSummary(await getComplianceOverview(supabase))
    : null;

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
    },
    {
      href: "/projects",
      label: "Projects",
      count: projects,
      detail: projects === 1 ? "1 transaction" : `${projects} transactions`,
      icon: Layers,
    },
    {
      href: "/documents",
      label: "Documents",
      count: docs,
      detail: docs === 1 ? "1 file shared" : `${docs} files shared`,
      icon: FileText,
    },
    {
      href: "/news",
      label: "News updates",
      count: news,
      detail: news === 1 ? "1 post" : `${news} posts`,
      icon: Newspaper,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="hero-band flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-label">{today}</p>
          <h1 className="display-title mt-4">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
            <span className="text-rust">.</span>
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            {site.name} — {site.tagline}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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

      <PriceTicker prices={await getMetalPrices()} tone="light" />

      {/* Consortium at a glance — the homepage's dark stats panel */}
      <div className="grid overflow-hidden rounded-[4px] bg-coal text-white lg:grid-cols-[1.25fr_1fr]">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ href, label, count, detail, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col justify-between gap-8 border-white/10 p-6 transition hover:bg-white/[0.04] [&:not(:last-child)]:border-r"
            >
              <span className="flex items-center justify-between text-white/40">
                <Icon size={16} strokeWidth={1.75} />
                <ArrowUpRight
                  size={14}
                  className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                />
              </span>
              <span>
                <span className="stat-value block">{count}</span>
                <span className="section-label mt-3 block text-white/55">{label}</span>
                <span className="mt-1 block text-xs text-white/35">{detail}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-8 border-white/10 bg-coal-2 p-6 sm:p-8 max-lg:border-t lg:border-l">
          {isAdmin && compliance ? (
            <>
              <div>
                <p className="section-label text-white/55">Schedule 1 compliance</p>
                <p className="mt-4 text-[64px] leading-none tracking-[-0.05em]">
                  {compliance.averagePercent}
                  <span className="text-rust">%</span>
                </p>
                <p className="mt-3 text-sm text-white/55">
                  {compliance.fullyCompliant} of {compliance.total} members fully
                  compliant · {compliance.incomplete} incomplete
                </p>
                <div className="mt-5 h-1 w-full bg-white/10">
                  <div
                    className="h-full bg-rust"
                    style={{ width: `${compliance.averagePercent}%` }}
                  />
                </div>
              </div>
              <Link
                href="/compliance"
                className="inline-flex items-center gap-2 self-start border-b border-white/40 pb-1.5 text-sm transition hover:border-rust hover:text-rust"
              >
                <ShieldCheck size={15} /> View compliance
              </Link>
            </>
          ) : (
            <>
              <div>
                <p className="section-label text-white/55">SEZ Africa protocol</p>
                <p className="mt-4 text-[22px] leading-snug tracking-[-0.02em]">
                  Identify<span className="text-rust">.</span> Verify
                  <span className="text-rust">.</span>
                  <br />
                  Protect<span className="text-rust">.</span> Transact
                  <span className="text-rust">.</span>
                </p>
                <p className="mt-3 text-sm text-white/55">
                  Every project follows the four-phase engagement protocol.
                </p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 self-start border-b border-white/40 pb-1.5 text-sm transition hover:border-rust hover:text-rust"
              >
                <Layers size={15} /> View projects
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="mb-4">
            <p className="section-label mb-1">Portal</p>
            <h2 className="text-xl font-semibold tracking-tight">
              Recent activity
            </h2>
          </div>
          <ActivityFeed />
        </section>

        <section>
          <div className="mb-4">
            <p className="section-label mb-1">Network</p>
            <h2 className="text-xl font-semibold tracking-tight">Members</h2>
          </div>
          <div className="card p-5">
            {recentMembers && recentMembers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recentMembers.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    title={member.full_name}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-stone text-xs font-medium text-coal ring-1 ring-line transition hover:bg-coal hover:text-white"
                  >
                    {member.full_name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p: string) => p[0]?.toUpperCase())
                      .join("")}
                  </Link>
                ))}
                <Link
                  href="/members"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-line-strong text-muted transition hover:border-line-strong hover:text-ink"
                >
                  <Plus size={16} />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted">No members yet.</p>
            )}
            <Link
              href="/members"
              className="mt-4 inline-block text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              View directory
            </Link>
          </div>
        </section>
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
