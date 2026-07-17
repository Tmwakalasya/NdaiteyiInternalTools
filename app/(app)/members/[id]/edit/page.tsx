import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { BackLink } from "@/components/BackLink";
import { MemberForm } from "@/components/MemberForm";
import type { Member } from "@/lib/types";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect(`/members/${id}`);

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single<Member>();

  if (!member) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <BackLink href={`/members/${id}`}>Back to profile</BackLink>
      <h1 className="display-title text-3xl sm:text-4xl">
        Edit {member.full_name}
      </h1>
      <MemberForm member={member} />
    </div>
  );
}
