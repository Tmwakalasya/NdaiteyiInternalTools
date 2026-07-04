"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { NewsPost } from "@/lib/types";

// Admin-only edit/delete controls shown on a news post.
export function NewsAdminActions({ post }: { post: NewsPost }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const sure = window.confirm(
      `Delete “${post.title}”? This cannot be undone.`
    );
    if (!sure) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("news_posts")
      .delete()
      .eq("id", post.id);
    if (error) {
      window.alert("The update could not be deleted. Please try again.");
      setBusy(false);
      return;
    }
    router.push("/news");
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Link href={`/news/${post.id}/edit`} className="btn-secondary">
        <Pencil size={15} /> Edit
      </Link>
      <button onClick={remove} className="btn-danger" disabled={busy}>
        <Trash2 size={15} /> {busy ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
