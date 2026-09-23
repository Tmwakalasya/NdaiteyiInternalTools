import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProjectWithStages } from "@/lib/projects";

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

  const project = await createProjectWithStages(supabase, {
    name: name.trim(),
    description: description?.trim() || null,
    createdBy: user.id,
  });

  if (!project) {
    return NextResponse.json(
      {
        error:
          "The project could not be created. If this is the first project, the database migration (supabase/02_projects_documents.sql) may still need to be run.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: project.id });
}
