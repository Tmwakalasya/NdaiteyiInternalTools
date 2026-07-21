import type { SupabaseClient } from "@supabase/supabase-js";
import { getRecentActivity } from "@/lib/activity";
import type { Notification } from "@/lib/types";

const SYNC_LIMIT = 30;

function activityEntityKey(type: string, id: string): string {
  return `${type}:${id}`;
}

export async function syncNotifications(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const activity = await getRecentActivity(supabase, SYNC_LIMIT);

  const rows = activity.map((item) => ({
    user_id: userId,
    type: item.type,
    title: item.summary,
    body: item.actorName ? `By ${item.actorName}` : null,
    href: item.href,
    entity_key: activityEntityKey(item.type, item.id),
    created_at: item.occurredAt,
  }));

  if (rows.length === 0) return;

  await supabase.from("notifications").upsert(rows, {
    onConflict: "user_id,entity_key",
    ignoreDuplicates: true,
  });
}

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string
): Promise<Notification[]> {
  await syncNotifications(supabase, userId);

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);

  return (data ?? []) as Notification[];
}

export async function getUnreadCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  await syncNotifications(supabase, userId);

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  return count ?? 0;
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  userId: string,
  notificationId: string
): Promise<void> {
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}
