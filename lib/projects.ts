import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultTransactionStages } from "@/lib/config";
import type { Project, ProjectStage } from "@/lib/types";

// Creates a project and seeds it with the SEZ Africa four-phase checklist.
// Returns null if the project row could not be created.
export async function createProjectWithStages(
  supabase: SupabaseClient,
  input: { name: string; description: string | null; createdBy: string }
): Promise<Project | null> {
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      description: input.description,
      created_by: input.createdBy,
    })
    .select()
    .single<Project>();

  if (error || !project) return null;

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

  return project;
}
