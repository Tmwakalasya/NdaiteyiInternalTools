import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StageTracker } from "@/components/StageTracker";
import { ProjectActions } from "@/components/ProjectActions";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import type { Document, Project, StageWithItems } from "@/lib/types";

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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>();

  if (!project) notFound();

  const [{ data: stages }, { data: documents }] = await Promise.all([
    supabase
      .from("project_stages")
      .select("*, project_stage_items(*)")
      .eq("project_id", id)
      .order("position")
      .returns<StageWithItems[]>(),
    supabase
      .from("documents")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .returns<Document[]>(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} /> All projects
        </Link>
        <ProjectActions project={project} />
      </div>

      <div className="card p-6 sm:p-8">
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
        >
          {statusLabel[project.status]}
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {project.name}
        </h1>
        {project.description && (
          <p className="mt-2 whitespace-pre-line text-muted">
            {project.description}
          </p>
        )}
      </div>

      <StageTracker projectId={project.id} initialStages={stages ?? []} />

      <div>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">
          Project documents
        </h2>
        <DocumentsPanel
          initialDocuments={documents ?? []}
          projects={[]}
          fixedProjectId={project.id}
        />
      </div>
    </div>
  );
}
