import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultTransactionStages } from "@/lib/config";
import type { Project, ProjectStage } from "@/lib/types";

// Creates a project and seeds it with the SEZ Africa four-phase checklist.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to add a project." },
      { status: 401 }
    );
  }

  const { name, description } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json(
      { error: "A project name is required." },
      { status: 400 }
    );
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      created_by: user.id,
    })
    .select()
    .single<Project>();

  if (error || !project) {
    return NextResponse.json(
      {
        error:
          "The project could not be created. If this is the first project, the database migration (supabase/02_projects_documents.sql) may still need to be run.",
      },
      { status: 500 }
    );
  }

  // Seed the phases and their tick-off items.
  for (let s = 0; s < defaultTransactionStages.length; s++) {
    const stage = defaultTransactionStages[s];
    const { data: stageRow } = await supabase
      .from("project_stages")
      .insert({
        project_id: project.id,
        name: stage.name,
        description: stage.description,
        position: s,
      })
      .select()
      .single<ProjectStage>();

    if (stageRow) {
      await supabase.from("project_stage_items").insert(
        stage.items.map((label, i) => ({
          stage_id: stageRow.id,
          label,
          position: i,
        }))
      );
    }
  }

  return NextResponse.json({ id: project.id });
}
