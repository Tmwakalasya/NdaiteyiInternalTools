import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import type { Project } from "@/lib/types";

type ProjectWithStages = Project & {
  project_stages: { completed: boolean }[];
};

const statusStyles: Record<Project["status"], string> = {
  active: "border-white/10 bg-white/[0.06] text-ink",
  on_hold: "border-line bg-white/[0.03] text-muted",
  completed: "border-emerald-400/20 bg-emerald-500/10 text-emerald-400",
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Transactions"
        title="Projects"
        description="Track each deal through the SEZ Africa engagement phases."
        action={
          <Link href="/projects/new" className="btn-primary">
            <Plus size={16} /> New project
          </Link>
        }
      />

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project) => {
            const stages = project.project_stages ?? [];
            const total = stages.length;
            const done = stages.filter((s) => s.completed).length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card-interactive group flex flex-col p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-snug tracking-tight transition group-hover:text-ink">
                    {project.name}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
                  >
                    {statusLabel[project.status]}
                  </span>
                </div>
                {project.description && (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
                    {project.description}
                  </p>
                )}
                <div className="mt-auto pt-6">
                  <div className="mb-2 flex items-center justify-between font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                    <span>
                      {done} / {total} phases
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No projects yet"
          description="Add a project to start tracking a transaction through the SEZ Africa phases."
          action={
            <Link href="/projects/new" className="btn-primary">
              <Plus size={15} /> New project
            </Link>
          }
        />
      )}
    </div>
  );
}
