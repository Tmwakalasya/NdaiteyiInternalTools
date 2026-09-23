import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { site } from "@/lib/config";
import {
  enquiryTitle,
  escapeHtml,
  interestLabel,
  parseEnquiry,
  type EnquiryInput,
} from "@/lib/enquiries";

// Receives the public homepage enquiry form. Anyone may call this, so it
// validates everything, filters bots and rate-limits by (hashed) IP before
// saving with the service-role client.

const MAX_PER_HOUR = 3;
const MIN_FILL_MS = 3000; // humans take longer than this to fill the form

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bot traps: a hidden field people never fill in, and a minimum time
  // between the form appearing and being sent. Bots get a fake success so
  // they don't learn to adapt.
  const startedAt = Number(body.startedAt);
  if (
    body.website ||
    !Number.isFinite(startedAt) ||
    Date.now() - startedAt < MIN_FILL_MS
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseEnquiry(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = createAdminClient();
  const ipHash = hashIp(request);

  if (ipHash) {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_PER_HOUR) {
      return NextResponse.json(
        {
          error:
            "We've received several enquiries from you already. Please try again later.",
        },
        { status: 429 }
      );
    }
  }

  const { data: saved, error } = await supabase
    .from("enquiries")
    .insert({ ...parsed.enquiry, ip_hash: ipHash })
    .select("id")
    .single<{ id: string }>();

  if (error || !saved) {
    return NextResponse.json(
      {
        error:
          "Your enquiry couldn't be sent just now. Please try again in a few minutes.",
      },
      { status: 500 }
    );
  }

  // Email admins, if email is set up. A failed email never fails the
  // submission: the enquiry is saved and shows in the portal regardless.
  await emailAdmins(parsed.enquiry, `${request.nextUrl.origin}/enquiries/${saved.id}`).catch(
    () => undefined
  );

  return NextResponse.json({ ok: true });
}

function hashIp(request: NextRequest): string | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip");
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!ip || !salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function emailAdmins(enquiry: EnquiryInput, link: string) {
  if (!process.env.RESEND_API_KEY) return;

  const supabase = createAdminClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("email")
    .eq("role", "admin");
  const to = (admins ?? []).map((a) => a.email).filter(Boolean);
  if (to.length === 0) return;

  const rows: [string, string | null][] = [
    ["Name", enquiry.full_name],
    ["Company", enquiry.company],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["Country", enquiry.country],
    ["Looking to", interestLabel[enquiry.interest]],
    ["Commodity", enquiry.commodity],
  ];
  const table = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#646961;">${k}</td><td style="padding:4px 0;">${escapeHtml(v!)}</td></tr>`
    )
    .join("");
  const message = escapeHtml(enquiry.message).replace(/\n/g, "<br/>");

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: `${site.name} <${process.env.NEWSLETTER_FROM_EMAIL ?? "onboarding@resend.dev"}>`,
    to,
    replyTo: enquiry.email,
    subject: `New enquiry: ${enquiryTitle(enquiry)}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#131715;max-width:560px;">
        <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#646961;">New website enquiry</p>
        <table style="font-size:14px;border-collapse:collapse;">${table}</table>
        <p style="font-size:14px;line-height:1.6;margin:20px 0;padding:16px;background:#f7f7f2;">${message}</p>
        <p><a href="${escapeHtml(link)}" style="color:#bc4228;">Open in the member portal</a> · reply to this email to answer them directly.</p>
      </div>`,
  });
}
