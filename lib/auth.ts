import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// One call to get the signed-in user and their profile (with role).
export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile, isAdmin: profile?.role === "admin" };
}
