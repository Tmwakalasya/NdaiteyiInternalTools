import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { complianceToCsv, getComplianceOverview } from "@/lib/compliance";

export async function GET() {
  const supabase = await createClient();
  const { isAdmin } = await getSessionProfile();

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await getComplianceOverview(supabase);
  const csv = complianceToCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="enm-schedule-1-compliance.csv"',
    },
  });
}
