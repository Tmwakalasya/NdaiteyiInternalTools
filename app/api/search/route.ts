import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchPortal } from "@/lib/search";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const results = await searchPortal(supabase, q);
  return NextResponse.json(results);
}
