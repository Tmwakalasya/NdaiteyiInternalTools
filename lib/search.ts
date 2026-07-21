import type { SupabaseClient } from "@supabase/supabase-js";
import type { SearchResults } from "@/lib/types";

const RESULT_LIMIT = 5;

export async function searchPortal(
  supabase: SupabaseClient,
  query: string
): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) {
    return { members: [], projects: [], documents: [], news: [] };
  }

  const pattern = `%${q}%`;

  const [
    { data: members },
    { data: projects },
    { data: documents },
    { data: news },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("id, full_name, organisation, country")
      .or(
        `full_name.ilike.${pattern},organisation.ilike.${pattern},country.ilike.${pattern},title.ilike.${pattern}`
      )
      .order("full_name")
      .limit(RESULT_LIMIT),
    supabase
      .from("projects")
      .select("id, name, status")
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(RESULT_LIMIT),
    supabase
      .from("documents")
      .select("id, name")
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(RESULT_LIMIT),
    supabase
      .from("news_posts")
      .select("id, title")
      .or(`title.ilike.${pattern},body.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(RESULT_LIMIT),
  ]);

  return {
    members: (members ?? []).map((m) => ({
      id: m.id,
      title: m.full_name,
      subtitle: [m.organisation, m.country].filter(Boolean).join(" · ") || undefined,
      href: `/members/${m.id}`,
    })),
    projects: (projects ?? []).map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.status.replace("_", " "),
      href: `/projects/${p.id}`,
    })),
    documents: (documents ?? []).map((d) => ({
      id: d.id,
      title: d.name,
      href: "/documents",
    })),
    news: (news ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      href: `/news/${n.id}`,
    })),
  };
}
