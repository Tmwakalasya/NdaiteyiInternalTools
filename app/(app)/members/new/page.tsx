import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { MemberForm } from "@/components/MemberForm";

export default async function NewMemberPage() {
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect("/members");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} /> All members
      </Link>
      <div>
        <p className="mono-label mb-3">Directory</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Add a member
        </h1>
        <p className="mt-2 text-muted">
          Fill in what you know — everything except the name is optional.
        </p>
      </div>
      <MemberForm />
    </div>
  );
}
