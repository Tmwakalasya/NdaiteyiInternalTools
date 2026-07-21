import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Layers,
  Newspaper,
  Upload,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { getRecentActivity, relativeTime } from "@/lib/activity";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";
import type { ActivityType } from "@/lib/types";

const iconByType: Record<ActivityType, LucideIcon> = {
  news_post: Newspaper,
  project_created: Layers,
  document_uploaded: FileText,
  member_document_uploaded: Upload,
  stage_completed: CheckCircle2,
  member_added: UserPlus,
};

const tileByType: Record<ActivityType, string> = {
  news_post: "metric-tile-rose",
  project_created: "metric-tile-violet",
  document_uploaded: "metric-tile-slate",
  member_document_uploaded: "metric-tile-indigo",
  stage_completed: "metric-tile-violet",
  member_added: "metric-tile-indigo",
};

export async function ActivityFeed() {
  const supabase = await createClient();
  const activity = await getRecentActivity(supabase);

  if (activity.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No activity yet"
        description="Recent uploads, projects, and updates will appear here."
      />
    );
  }

  return (
    <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      {activity.map((item) => {
        const Icon = iconByType[item.type];
        return (
          <Link
            key={item.id}
            href={item.href}
            className="document-row group block px-5 py-4 hover:bg-panel/80"
          >
            <span className={`${tileByType[item.type]} h-9 w-9 shrink-0 rounded-lg`}>
              <Icon size={16} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug group-hover:text-ink">
                {item.summary}
              </p>
              <p className="mt-1 font-mono text-[11px] tracking-wide text-muted">
                {item.actorName ? `${item.actorName} · ` : ""}
                {relativeTime(item.occurredAt)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
