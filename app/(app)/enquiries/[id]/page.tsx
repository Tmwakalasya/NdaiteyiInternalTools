import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { interestLabel, statusLabel } from "@/lib/enquiries";
import { BackLink } from "@/components/BackLink";
import { EnquiryActions } from "@/components/EnquiryActions";
import type { Enquiry } from "@/lib/types";

export default async function EnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect("/dashboard");

  const { id } = await params;
  const supabase = await createClient();
  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .single<Enquiry>();
  if (!enquiry) notFound();

  const received = new Date(enquiry.created_at).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const details: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${enquiry.email}`} className="text-rust hover:underline">{enquiry.email}</a>],
    ["Phone", enquiry.phone],
    ["Company", enquiry.company],
    ["Country", enquiry.country],
    ["Looking to", interestLabel[enquiry.interest]],
    ["Commodity", enquiry.commodity],
  ];

  return (
    <div className="space-y-8">
      <BackLink href="/enquiries">All enquiries</BackLink>

      <div className="hero-band flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-label">Received {received}</p>
          <h1 className="display-title mt-4">
            {enquiry.full_name}
            <span className="text-rust">.</span>
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-[15px] text-muted">
            <span className={enquiry.status === "new" ? "badge-accent" : "badge"}>
              {statusLabel[enquiry.status]}
            </span>
            {enquiry.company}
          </p>
        </div>
        <EnquiryActions enquiry={enquiry} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <dl className="card divide-y divide-line">
          {details
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} className="flex gap-4 px-5 py-3.5 text-sm">
                <dt className="section-label w-24 shrink-0 pt-0.5">{label}</dt>
                <dd className="min-w-0 break-words">{value}</dd>
              </div>
            ))}
        </dl>

        <div className="card p-6">
          <p className="section-label">Message</p>
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">
            {enquiry.message}
          </p>
        </div>
      </div>
    </div>
  );
}
