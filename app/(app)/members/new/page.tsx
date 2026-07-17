import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BackLink } from "@/components/BackLink";
import { MemberForm } from "@/components/MemberForm";
import { PageHeader } from "@/components/PageHeader";

export default async function NewMemberPage() {
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect("/members");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <BackLink href="/members">All members</BackLink>
      <PageHeader
        eyebrow="Directory"
        title="Add a member"
        description="Fill in what you know — everything except the name is optional."
      />
      <MemberForm />
    </div>
  );
}
