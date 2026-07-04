import Link from "next/link";
import { MapPin, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label mb-3">Directory</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Members
          </h1>
          <p className="mt-3 text-muted">
            {members?.length ?? 0} {members?.length === 1 ? "person" : "people"} in
            the consortium directory
          </p>
        </div>
        {isAdmin && (
          <Link href="/members/new" className="btn-primary">
            <Plus size={16} /> Add member
          </Link>
        )}
      </div>

      <form className="relative max-w-md" action="/members">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="card group flex flex-col gap-4 p-5 transition hover:border-line-strong"
            >
              <div className="flex items-start gap-4">
                <Avatar name={member.full_name} photoUrl={member.photo_url} />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold leading-snug tracking-tight transition group-hover:text-accent">
                    {member.full_name}
                  </h2>
                  {member.country && (
                    <p className="mt-1 flex items-center gap-1 font-mono text-xs text-muted">
                      <MapPin size={12} /> {member.country}
                    </p>
                  )}
                </div>
              </div>
              {member.title && (
                <p className="line-clamp-2 text-sm text-muted">{member.title}</p>
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
        <div className="card p-10 text-center text-muted">
          {q ? (
            <>No members match &ldquo;{q}&rdquo;.</>
          ) : (
            <>No members yet — add the first one.</>
          )}
        </div>
      )}
    </div>
  );
}
