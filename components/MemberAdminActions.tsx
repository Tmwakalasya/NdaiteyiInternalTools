"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Member } from "@/lib/types";

// Admin-only panel on a member's page: invite them to log in, or remove them.
export function MemberAdminActions({ member }: { member: Member }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"invite" | "delete" | null>(null);

  async function invite() {
    if (!member.email) return;
    setBusy("invite");
    setMessage(null);
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: member.email }),
    });
    const data = await res.json();
    setMessage(
      res.ok
        ? `An invitation email is on its way to ${member.email}.`
        : data.error ?? "The invitation could not be sent."
    );
    setBusy(null);
  }

  async function remove() {
    const sure = window.confirm(
      `Remove ${member.full_name} from the directory? This cannot be undone.`
    );
    if (!sure) return;
    setBusy("delete");
    const supabase = createClient();
    const { error } = await supabase.from("members").delete().eq("id", member.id);
    if (error) {
      setMessage("The member could not be removed. Please try again.");
      setBusy(null);
      return;
    }
    router.push("/members");
    router.refresh();
  }

  return (
    <div className="card p-6">
      <p className="mono-label mb-2">Admin</p>
      <h2 className="text-lg font-semibold tracking-tight">Actions</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={invite}
          className="btn-secondary"
          disabled={!member.email || busy !== null}
          title={member.email ? undefined : "Add an email address first"}
        >
          <UserPlus size={15} />
          {busy === "invite" ? "Sending…" : "Invite to log in"}
        </button>
        <button
          onClick={remove}
          className="btn-danger"
          disabled={busy !== null}
        >
          <Trash2 size={15} />
          {busy === "delete" ? "Removing…" : "Remove member"}
        </button>
      </div>
      {message && (
        <p className="mt-4 rounded-xl border border-line bg-base px-4 py-3 text-sm text-ink/85">
          {message}
        </p>
      )}
    </div>
  );
}
