"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Layers, Mail, RotateCcw, X } from "lucide-react";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

// Reply / review / decline / convert controls on an enquiry page.
export function EnquiryActions({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(url: string, init: RequestInit) {
    setBusy(true);
    setError(null);
    const res = await fetch(url, init);
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      return null;
    }
    return json;
  }

  async function setStatus(status: EnquiryStatus) {
    const ok = await call(`/api/enquiries/${enquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (ok) router.refresh();
  }

  async function convert() {
    const json = await call(`/api/enquiries/${enquiry.id}/convert`, {
      method: "POST",
    });
    if (json?.id) {
      router.push(`/projects/${json.id}`);
      router.refresh();
    }
  }

  const subject = encodeURIComponent(
    `Re: your enquiry${enquiry.commodity ? ` about ${enquiry.commodity}` : ""}`
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <a href={`mailto:${enquiry.email}?subject=${subject}`} className="btn-primary">
          <Mail size={15} /> Reply by email
        </a>

        {enquiry.status === "converted" && enquiry.project_id ? (
          <Link href={`/projects/${enquiry.project_id}`} className="btn-secondary">
            <ArrowUpRight size={15} /> Open project
          </Link>
        ) : (
          <>
            <button type="button" onClick={convert} disabled={busy} className="btn-secondary">
              <Layers size={15} /> Convert to project
            </button>
            {enquiry.status === "new" && (
              <button type="button" onClick={() => setStatus("in_review")} disabled={busy} className="btn-secondary">
                Mark in review
              </button>
            )}
            {enquiry.status === "declined" ? (
              <button type="button" onClick={() => setStatus("new")} disabled={busy} className="btn-secondary">
                <RotateCcw size={15} /> Reopen
              </button>
            ) : (
              <button type="button" onClick={() => setStatus("declined")} disabled={busy} className="btn-danger">
                <X size={15} /> Decline
              </button>
            )}
          </>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
