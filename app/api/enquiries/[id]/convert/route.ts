import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { enquiryTitle, interestLabel } from "@/lib/enquiries";
import { createProjectWithStages } from "@/lib/projects";
import type { Enquiry } from "@/lib/types";

// Turns an enquiry into a project with the four-phase checklist, and links
// the two. Admins only.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, isAdmin } = await getSessionProfile();
  if (!user || !isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can manage enquiries." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .single<Enquiry>();

  if (!enquiry) {
    return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  }
  if (enquiry.project_id) {
    return NextResponse.json({ id: enquiry.project_id });
  }

  const details = [
    `From the website enquiry by ${enquiry.full_name}${enquiry.company ? ` (${enquiry.company})` : ""}.`,
    `Looking to: ${interestLabel[enquiry.interest]}${enquiry.commodity ? ` · ${enquiry.commodity}` : ""}${enquiry.country ? ` · ${enquiry.country}` : ""}.`,
    `Contact: ${enquiry.email}${enquiry.phone ? ` · ${enquiry.phone}` : ""}.`,
  ].join("\n");

  const project = await createProjectWithStages(supabase, {
    name: enquiryTitle(enquiry),
    description: details,
    createdBy: user.id,
  });
  if (!project) {
    return NextResponse.json(
      { error: "The project could not be created. Please try again." },
      { status: 500 }
    );
  }

  await supabase
    .from("enquiries")
    .update({ status: "converted", project_id: project.id })
    .eq("id", id);

  return NextResponse.json({ id: project.id });
}
