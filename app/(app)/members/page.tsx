import Link from "next/link";
import { MapPin, Plus, Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import type { Member } from "@/lib/types";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { isAdmin } = await getSessionProfile();

  let query = supabase.from("members").select("*").order("full_name");
  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,organisation.ilike.%${q}%,country.ilike.%${q}%,title.ilike.%${q}%`
    );
  }
  const { data: members } = await query.returns<Member[]>();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Directory"
        title="Members"
        description={`${members?.length ?? 0} ${members?.length === 1 ? "person" : "people"} in the consortium directory`}
        action={
          isAdmin ? (
            <Link href="/members/new" className="btn-primary">
              <Plus size={16} /> Add member
            </Link>
          ) : undefined
        }
      />

      <form className="relative max-w-lg" action="/members">
        <Search
          size={17}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name, organisation or country…"
          className="input pl-11"
        />
      </form>

      {members && members.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="card-interactive group flex flex-col gap-4 p-5"
            >
              <div className="flex items-start gap-4">
                <Avatar name={member.full_name} photoUrl={member.photo_url} />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold leading-snug tracking-tight transition group-hover:text-ink">
                    {member.full_name}
                  </h2>
                  {member.country && (
                    <p className="mt-1.5 flex items-center gap-1 font-mono text-xs text-muted">
                      <MapPin size={12} /> {member.country}
                    </p>
                  )}
                </div>
              </div>
              {member.title && (
                <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                  {member.title}
                </p>
              )}
              {member.organisation && (
                <p className="badge w-fit max-w-full">
                  <span className="truncate">{member.organisation}</span>
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={q ? `No members match “${q}”` : "No members yet"}
          description={
            q ? undefined : "Add the first person to the consortium directory."
          }
          action={
            !q && isAdmin ? (
              <Link href="/members/new" className="btn-primary">
                <Plus size={16} /> Add member
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
