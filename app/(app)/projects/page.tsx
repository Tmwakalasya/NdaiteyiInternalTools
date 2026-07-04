import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

type ProjectWithStages = Project & {
  project_stages: { completed: boolean }[];
};

const statusStyles: Record<Project["status"], string> = {
  active: "border-accent/20 bg-accent/10 text-accent",
  on_hold: "border-line-strong bg-base text-muted",
  completed:
    "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-400",
};

const statusLabel: Record<Project["status"], string> = {
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, project_stages(completed)")
    .order("created_at", { ascending: false })
    .returns<ProjectWithStages[]>();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label mb-3">Transactions</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Projects
          </h1>
          <p className="mt-3 text-muted">
            Track each deal through the SEZ Africa engagement phases.
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary">
          <Plus size={16} /> New project
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const stages = project.project_stages ?? [];
            const total = stages.length;
            const done = stages.filter((s) => s.completed).length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card group flex flex-col p-6 transition hover:border-line-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-snug tracking-tight transition group-hover:text-accent">
                    {project.name}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
                  >
                    {statusLabel[project.status]}
                  </span>
                </div>
                {project.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {project.description}
                  </p>
                )}
                <div className="mt-auto pt-5">
                  <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    <span>
                      {done} / {total} phases
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-base text-muted">
            <Layers size={22} />
          </span>
          <p className="mt-4 text-sm font-medium">No projects yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Add a project to start tracking a transaction through the SEZ Africa
            phases.
          </p>
          <Link href="/projects/new" className="btn-primary mt-5">
            <Plus size={15} /> New project
          </Link>
        </div>
      )}
    </div>
  );
}
