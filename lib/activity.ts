import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityItem } from "@/lib/types";

const FETCH_LIMIT = 10;

function nestedField<T extends Record<string, string>>(
  relation: T | T[] | null | undefined,
  field: keyof T
): string | undefined {
  if (!relation) return undefined;
  if (Array.isArray(relation)) return relation[0]?.[field];
  return relation[field];
}

export async function getRecentActivity(
  supabase: SupabaseClient,
  limit = 20
): Promise<ActivityItem[]> {
  const [
    { data: newsPosts },
    { data: projects },
    { data: documents },
    { data: memberDocs },
    { data: stages },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("news_posts")
      .select("id, title, author_id, created_at")
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT),
    supabase
      .from("projects")
      .select("id, name, created_by, created_at")
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT),
    supabase
      .from("documents")
      .select("id, name, uploaded_by, created_at")
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT),
    supabase
      .from("member_documents")
      .select("id, label, uploaded_by, created_at, member_id, members(full_name)")
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT),
    supabase
      .from("project_stages")
      .select("id, name, completed_at, project_id, projects(name)")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(FETCH_LIMIT),
    supabase
      .from("members")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT),
  ]);

  const items: ActivityItem[] = [];

  for (const post of newsPosts ?? []) {
    items.push({
      id: `news-${post.id}`,
      type: "news_post",
      summary: `Posted “${post.title}”`,
      href: `/news/${post.id}`,
      actorId: post.author_id,
      occurredAt: post.created_at,
    });
  }

  for (const project of projects ?? []) {
    items.push({
      id: `project-${project.id}`,
      type: "project_created",
      summary: `Created project “${project.name}”`,
      href: `/projects/${project.id}`,
      actorId: project.created_by,
      occurredAt: project.created_at,
    });
  }

  for (const doc of documents ?? []) {
    items.push({
      id: `doc-${doc.id}`,
      type: "document_uploaded",
      summary: `Uploaded “${doc.name}”`,
      href: "/documents",
      actorId: doc.uploaded_by,
      occurredAt: doc.created_at,
    });
  }

  for (const doc of memberDocs ?? []) {
    const memberName =
      nestedField(doc.members as { full_name: string } | { full_name: string }[] | null, "full_name") ??
      "a member";
    items.push({
      id: `member-doc-${doc.id}`,
      type: "member_document_uploaded",
      summary: `Uploaded ${doc.label} for ${memberName}`,
      href: `/members/${doc.member_id}`,
      actorId: doc.uploaded_by,
      occurredAt: doc.created_at,
    });
  }

  for (const stage of stages ?? []) {
    const projectName =
      nestedField(stage.projects as { name: string } | { name: string }[] | null, "name") ??
      "a project";
    items.push({
      id: `stage-${stage.id}`,
      type: "stage_completed",
      summary: `Completed “${stage.name}” on ${projectName}`,
      href: `/projects/${stage.project_id}`,
      actorId: null,
      occurredAt: stage.completed_at!,
    });
  }

  for (const member of members ?? []) {
    items.push({
      id: `member-${member.id}`,
      type: "member_added",
      summary: `Added member ${member.full_name}`,
      href: `/members/${member.id}`,
      actorId: null,
      occurredAt: member.created_at,
    });
  }

  items.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  const trimmed = items.slice(0, limit);
  const actorIds = [
    ...new Set(trimmed.map((i) => i.actorId).filter(Boolean)),
  ] as string[];

  if (actorIds.length === 0) {
    return trimmed;
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", actorIds);

  const actorNames = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      p.full_name?.trim() || p.email.split("@")[0],
    ])
  );

  return trimmed.map((item) => ({
    ...item,
    actorName: item.actorId ? actorNames.get(item.actorId) : undefined,
  }));
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
