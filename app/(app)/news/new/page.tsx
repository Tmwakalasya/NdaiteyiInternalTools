import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BackLink } from "@/components/BackLink";
import { NewsForm } from "@/components/NewsForm";
import { PageHeader } from "@/components/PageHeader";

export default async function NewNewsPage() {
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect("/news");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <BackLink href="/news">All news</BackLink>
      <PageHeader
        eyebrow="Newsletter"
        title="Post an update"
        description="It will appear on the News page — and can also be emailed to every member with an email address."
      />
      <NewsForm />
    </div>
  );
}
