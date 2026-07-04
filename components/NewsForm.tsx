"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { NewsPost } from "@/lib/types";

// One form for both "Post an update" and "Edit update".
// Creating goes through /api/news (so it can also email members);
// editing updates the row directly and never re-sends the email.
export function NewsForm({ post }: { post?: NewsPost }) {
  const router = useRouter();
  const editing = !!post;
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [sendEmail, setSendEmail] = useState(!editing);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (editing) {
      const supabase = createClient();
      const { error: saveError } = await supabase
        .from("news_posts")
        .update({ title: title.trim(), body: body.trim() })
        .eq("id", post!.id);
      if (saveError) {
        setError("The changes could not be saved. Please try again.");
        setBusy(false);
        return;
      }
      router.push(`/news/${post!.id}`);
      router.refresh();
      return;
    }

    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, sendEmail }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "The update could not be posted. Please try again.");
      setBusy(false);
      return;
    }

    // Post saved. If emailing was requested but not possible, explain why.
    if (data.warning) {
      window.alert(data.warning);
    }
    router.push(`/news/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
      <div>
        <label className="label" htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Update on the Congo supplier discussions"
        />
      </div>

      <div>
        <label className="label" htmlFor="body">
          Message *
        </label>
        <textarea
          id="body"
          className="input min-h-52"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          placeholder="Write the update here. Leave a blank line between paragraphs."
        />
      </div>

      {!editing && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-base p-4">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-accent"
          />
          <span className="text-sm">
            <span className="font-medium text-ink">
              Also send this as an email newsletter
            </span>
            <br />
            <span className="text-muted">
              Every member with an email address in the directory will receive it.
            </span>
          </span>
        </label>
      )}

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-3 border-t border-line pt-5">
        <button type="submit" className="btn-primary" disabled={busy}>
          <Send size={15} />
          {busy
            ? "Saving…"
            : editing
              ? "Save changes"
              : sendEmail
                ? "Post and email"
                : "Post update"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
