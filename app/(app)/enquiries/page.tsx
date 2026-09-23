import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { relativeTime } from "@/lib/activity";
import { interestLabel, statusLabel } from "@/lib/enquiries";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

const filters: { key: EnquiryStatus | "open" | "all"; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "converted", label: "Converted" },
  { key: "declined", label: "Declined" },
  { key: "all", label: "All" },
];

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect("/dashboard");

  const { status = "open" } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status === "open") query = query.in("status", ["new", "in_review"]);
  else if (status !== "all") query = query.eq("status", status);
  const { data: enquiries } = await query.returns<Enquiry[]>();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Website"
        title="Enquiries"
        description="Sent from the enquiry form on the public homepage. Only administrators can see these."
      />

      <nav className="flex flex-wrap gap-2" aria-label="Filter enquiries">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key === "open" ? "/enquiries" : `/enquiries?status=${f.key}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              status === f.key
                ? "border-coal bg-coal text-white"
                : "border-line-strong text-muted hover:border-coal hover:text-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {enquiries && enquiries.length > 0 ? (
        <ul className="card divide-y divide-line overflow-hidden">
          {enquiries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/enquiries/${e.id}`}
                className="flex flex-col gap-2 p-5 transition hover:bg-panel/60 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {e.status === "new" && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-rust" aria-label="New" />
                    )}
                    <span className="truncate">
                      {e.full_name}
                      {e.company && <span className="text-muted"> · {e.company}</span>}
                    </span>
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">{e.message}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm">
                  <span className="badge">{interestLabel[e.interest]}</span>
                  {e.commodity && <span className="badge max-w-[16rem] truncate">{e.commodity}</span>}
                  <span className={e.status === "new" ? "badge-accent" : "badge"}>
                    {statusLabel[e.status]}
                  </span>
                  <span className="w-16 text-right font-mono text-[11px] text-muted">
                    {relativeTime(e.created_at)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Inbox}
          title={status === "open" ? "No open enquiries" : "Nothing here yet"}
          description="Enquiries from the website's contact form will appear here."
        />
      )}
    </div>
  );
}
