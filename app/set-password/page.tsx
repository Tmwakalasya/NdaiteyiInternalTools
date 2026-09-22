"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { site } from "@/lib/config";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setHasSession(!!data.user));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setMessage("Please choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("The two passwords don't match.");
      return;
    }
    setBusy(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage("Something went wrong. Please try again.");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow={`${site.shortName} member portal`}
      title={
        <>
          Choose a password<span className="text-rust">.</span>
        </>
      }
    >
      <div>
        {hasSession === false ? (
          <p className="rounded-[4px] border border-amber-700/20 bg-amber-600/[0.07] px-4 py-3 text-sm text-amber-900">
            This link has expired or was already used. Go back to sign in and
            choose &ldquo;Forgotten your password?&rdquo; to get a fresh one.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              autoComplete="new-password"
            />
            <input
              id="confirm"
              type="password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              required
              autoComplete="new-password"
            />

            {message && (
              <p className="rounded-[4px] bg-panel px-4 py-3 text-sm text-ink/80">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary-hero"
              disabled={busy || hasSession === null}
            >
              {busy ? "Saving…" : "Save and continue"}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
