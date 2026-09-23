import type { EnquiryInterest, EnquiryStatus } from "@/lib/types";

export const interestLabel: Record<EnquiryInterest, string> = {
  buying: "Buying",
  selling: "Selling",
  partnership: "Partnership",
  other: "Other",
};

export const statusLabel: Record<EnquiryStatus, string> = {
  new: "New",
  in_review: "In review",
  converted: "Converted to project",
  declined: "Declined",
};

export type EnquiryInput = {
  full_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  interest: EnquiryInterest;
  commodity: string | null;
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

// Validates a submission from the public form. Returns the cleaned
// enquiry, or an error message suitable for showing to the visitor.
export function parseEnquiry(
  body: Record<string, unknown>
): { enquiry: EnquiryInput } | { error: string } {
  const full_name = text(body.full_name, 200);
  const email = text(body.email, 320);
  const message = text(body.message, 5000);
  const interest = body.interest;

  if (!full_name) return { error: "Please tell us your name." };
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (
    typeof interest !== "string" ||
    !(interest in interestLabel)
  ) {
    return { error: "Please choose what you're looking to do." };
  }
  if (!message || message.length < 10) {
    return { error: "Please add a short message (at least 10 characters)." };
  }

  return {
    enquiry: {
      full_name,
      email,
      message,
      interest: interest as EnquiryInterest,
      company: text(body.company, 200),
      phone: text(body.phone, 50),
      country: text(body.country, 100),
      commodity: text(body.commodity, 200),
    },
  };
}

// A short title for an enquiry, e.g. "Copper — Acme Mining (selling)".
export function enquiryTitle(e: {
  full_name: string;
  company: string | null;
  commodity: string | null;
  interest: EnquiryInterest;
}): string {
  const who = e.company || e.full_name;
  const what = e.commodity ? `${e.commodity} — ` : "";
  // Collapse whitespace: this is also used as an email subject line.
  return `${what}${who} (${interestLabel[e.interest].toLowerCase()})`.replace(
    /\s+/g,
    " "
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
