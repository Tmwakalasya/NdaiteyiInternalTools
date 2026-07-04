import { createClient } from "@/lib/supabase/server";
import { DocumentsPanel } from "@/components/DocumentsPanel";
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
    <div className="space-y-6">
      <div>
        <p className="mono-label mb-3">Files</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Documents
        </h1>
        <p className="mt-3 text-muted">
          Shared consortium files. Private to signed-in members — links expire
          after an hour.
        </p>
      </div>

      <DocumentsPanel
        initialDocuments={documents ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}
