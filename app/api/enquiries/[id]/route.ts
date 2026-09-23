import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import type { EnquiryStatus } from "@/lib/types";

// Changes an enquiry's status. Admins only. "converted" is set by the
// convert endpoint, not here.
const allowed: EnquiryStatus[] = ["new", "in_review", "declined"];

export async function PATCH(
  request: NextRequest,
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
  const { status } = await request.json();
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id)
    .neq("status", "converted");

  if (error) {
    return NextResponse.json(
      { error: "The enquiry could not be updated. Please try again." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
