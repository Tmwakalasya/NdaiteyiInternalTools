import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to project
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Edit project
      </h1>
      <ProjectForm project={project} />
    </div>
  );
}
