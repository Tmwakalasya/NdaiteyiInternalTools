import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { NewsForm } from "@/components/NewsForm";

export default async function NewNewsPage() {
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect("/news");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} /> All news
      </Link>
      <div>
        <p className="mono-label mb-3">Newsletter</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Post an update
        </h1>
        <p className="mt-2 text-muted">
          It will appear on the News page — and can also be emailed to every
          member with an email address.
        </p>
      </div>
      <NewsForm />
    </div>
  );
}
