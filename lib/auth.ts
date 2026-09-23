import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type SessionUser = { id: string; email: string | undefined };

// The signed-in user and their profile (with role).
//
// Wrapped in React's cache() so the layout and page share one lookup per
// request instead of each doing their own. getClaims() verifies the login
// token locally against the project's signing keys, so it doesn't need a
// round trip to Supabase Auth on every page view.
export const getSessionProfile = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    return { user: null, profile: null, isAdmin: false } as const;
  }

  const user: SessionUser = {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile, isAdmin: profile?.role === "admin" };
});
