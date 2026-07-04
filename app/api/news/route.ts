import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { site } from "@/lib/config";
import type { Member, NewsPost } from "@/lib/types";

// Creates a news post, and optionally emails it to every member.
// Only administrators may call this.
export async function POST(request: NextRequest) {
  const { user, isAdmin } = await getSessionProfile();
  if (!user || !isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can post news." },
      { status: 403 }
    );
  }

  const { title, body, sendEmail } = await request.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json(
      { error: "A title and a message are both required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: post, error: insertError } = await supabase
    .from("news_posts")
    .insert({ title: title.trim(), body: body.trim(), author_id: user.id })
    .select()
    .single<NewsPost>();

  if (insertError || !post) {
    return NextResponse.json(
      { error: "The update could not be saved. Please try again." },
      { status: 500 }
    );
  }

  if (!sendEmail) {
    return NextResponse.json({ id: post.id });
  }

  // --- Email the newsletter ---
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      id: post.id,
      warning:
        "The update was posted on the site, but email is not set up yet (missing RESEND_API_KEY). See the README to enable it.",
    });
  }

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .not("email", "is", null)
    .returns<Member[]>();

  const recipients = [...new Set((members ?? []).map((m) => m.email!))];
  if (recipients.length === 0) {
    return NextResponse.json({
      id: post.id,
      warning:
        "The update was posted, but no members have an email address yet, so no emails were sent.",
    });
  }

  const paragraphs = post.body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailError } = await resend.emails.send({
    from: `${site.name} <${process.env.NEWSLETTER_FROM_EMAIL ?? "onboarding@resend.dev"}>`,
    to: user.email!,
    bcc: recipients,
    subject: post.title,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#221d18;">
        <h1 style="font-size:22px;margin:0 0 4px;">${post.title}</h1>
        <p style="color:#7c7368;font-size:13px;margin:0 0 24px;">${site.name} — member update</p>
        <div style="font-family:Arial,sans-serif;font-size:15px;">${paragraphs}</div>
        <hr style="border:none;border-top:1px solid #e7dfd2;margin:24px 0;"/>
        <p style="color:#7c7368;font-size:12px;">You received this because you are a member of the ${site.name}.</p>
      </div>
    `,
  });

  if (emailError) {
    return NextResponse.json({
      id: post.id,
      warning: `The update was posted on the site, but the email could not be sent: ${emailError.message}`,
    });
  }

  await supabase
    .from("news_posts")
    .update({ emailed_at: new Date().toISOString() })
    .eq("id", post.id);

  return NextResponse.json({ id: post.id });
}
