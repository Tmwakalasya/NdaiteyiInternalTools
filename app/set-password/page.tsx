"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/Logo";
import { GradientShell } from "@/components/GradientShell";
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
    <GradientShell variant="hero">
      <main className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6 py-16">
        <LogoMark className="mb-6 h-10 w-10 text-xs" />

        <div className="text-center">
          <p className="text-lg text-white/70">{site.shortName}</p>
          <h1 className="display-title mt-1 text-white">Choose a password</h1>
        </div>

        <div className="card-glass mt-6 w-full max-w-md p-3 sm:p-4">
          {hasSession === false ? (
            <p className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
              This link has expired or was already used. Go back to sign in and
              choose &ldquo;Forgotten your password?&rdquo; to get a fresh one.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                id="password"
                type="password"
                className="input-glass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                autoComplete="new-password"
              />
              <input
                id="confirm"
                type="password"
                className="input-glass"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                required
                autoComplete="new-password"
              />

              {message && (
                <p className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/75">
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
      </main>
    </GradientShell>
  );
}
