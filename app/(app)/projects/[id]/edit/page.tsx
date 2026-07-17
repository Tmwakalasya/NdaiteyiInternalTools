import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { ProjectForm } from "@/components/ProjectForm";
import type { Project } from "@/lib/types";

export default async function EditProjectPage({
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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <BackLink href={`/projects/${id}`}>Back to project</BackLink>
      <PageHeader eyebrow="Transactions" title="Edit project" />
      <ProjectForm project={project} />
    </div>
  );
}
