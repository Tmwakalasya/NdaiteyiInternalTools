import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Briefcase,
  ClipboardList,
  Mail,
  MapPin,
  Pencil,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { BackLink } from "@/components/BackLink";
import { MemberAdminActions } from "@/components/MemberAdminActions";
import { MemberDocuments } from "@/components/MemberDocuments";
import type { Member, MemberDocument } from "@/lib/types";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { isAdmin } = await getSessionProfile();

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single<Member>();

  if (!member) notFound();

  const { data: memberDocs } = await supabase
    .from("member_documents")
    .select("*")
    .eq("member_id", id)
    .order("created_at", { ascending: false })
    .returns<MemberDocument[]>();

  const facts = [
    { icon: Mail, label: "Email", value: member.email, href: member.email ? `mailto:${member.email}` : null },
    { icon: Phone, label: "Phone", value: member.phone, href: member.phone ? `tel:${member.phone}` : null },
    { icon: Building2, label: "Organisation", value: member.organisation, href: null },
    { icon: Briefcase, label: "Role in transaction", value: member.role_in_transaction, href: null },
    { icon: ClipboardList, label: "Areas of responsibility", value: member.responsibilities, href: null },
  ].filter((f) => f.value);

  return (
    <div className="space-y-8">
      <BackLink href="/members">All members</BackLink>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar name={member.full_name} photoUrl={member.photo_url} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="display-title text-3xl sm:text-4xl">
              {member.full_name}
            </h1>
            {member.title && <p className="mt-2 text-muted">{member.title}</p>}
            {member.country && (
              <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-muted">
                <MapPin size={13} /> {member.country}
              </p>
            )}
          </div>
          {isAdmin && (
            <div className="flex shrink-0 gap-2">
              <Link href={`/members/${member.id}/edit`} className="btn-secondary">
                <Pencil size={15} /> Edit
              </Link>
            </div>
          )}
        </div>

        {facts.length > 0 && (
          <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-2">
            {facts.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-3">
                <Icon size={18} className="mt-0.5 shrink-0 text-accent" />
                <div className="min-w-0">
                  <dt className="mono-label !tracking-[0.14em]">{label}</dt>
                  <dd className="mt-1 text-sm">
                    {href ? (
                      <a
                        href={href}
                        className="break-words text-accent underline-offset-4 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="break-words text-ink/90">{value}</span>
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        )}

        {member.bio && (
          <div className="mt-8 border-t border-line pt-6">
            <h2 className="text-lg font-semibold tracking-tight">Background</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/75">
              {member.bio}
            </p>
          </div>
        )}
      </div>

      <MemberDocuments
        memberId={member.id}
        initialDocuments={memberDocs ?? []}
      />

      {isAdmin && <MemberAdminActions member={member} />}
    </div>
  );
}
