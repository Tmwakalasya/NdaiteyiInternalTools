import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { StageTracker } from "@/components/StageTracker";
import { ProjectActions } from "@/components/ProjectActions";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import type { Document, Project, StageWithItems } from "@/lib/types";

const statusStyles: Record<Project["status"], string> = {
  active: "border-rust/25 bg-rust/[0.07] text-rust",
  on_hold: "border-line bg-panel text-muted",
  completed: "border-emerald-700/20 bg-emerald-700/[0.07] text-emerald-800",
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
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <BackLink href="/projects">All projects</BackLink>
        <ProjectActions project={project} />
      </div>

      <div className="card p-6 sm:p-8">
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
        >
          {statusLabel[project.status]}
        </span>
        <h1 className="display-title mt-4 text-3xl sm:text-4xl">
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
        <h2 className="mb-4 text-xl font-bold tracking-tight">
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
