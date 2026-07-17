import { createClient } from "@/lib/supabase/server";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { PageHeader } from "@/components/PageHeader";
import type { Document } from "@/lib/types";

export default async function DocumentsPage() {
  const supabase = await createClient();

  const [{ data: documents }, { data: projects }] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Document[]>(),
    supabase
      .from("projects")
      .select("id, name")
      .order("name")
      .returns<{ id: string; name: string }[]>(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Files"
        title="Documents"
        description="Shared consortium files. Private to signed-in members — links expire after an hour."
      />

      <DocumentsPanel
        initialDocuments={documents ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}
