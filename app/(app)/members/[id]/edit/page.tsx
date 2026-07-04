import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
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
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/members/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to profile
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Edit {member.full_name}
      </h1>
      <MemberForm member={member} />
    </div>
  );
}
