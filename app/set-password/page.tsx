"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/config";

// People land here from an invite or password-reset email link.
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
    <main className="relative z-[1] flex flex-1 items-center justify-center p-6">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
          <KeyRound size={18} strokeWidth={2.25} />
        </span>
        <p className="mono-label mb-3">{site.name}</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Choose a <span className="emph">password</span>
        </h1>

        {hasSession === false ? (
          <p className="mt-6 rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent">
            This link has expired or was already used. Please go back to the
            sign-in page and choose &ldquo;Forgotten your password?&rdquo; to
            get a fresh one.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="password">
                New password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="label" htmlFor="confirm">
                Type it again
              </label>
              <input
                id="confirm"
                type="password"
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {message && (
              <p className="rounded-xl border border-line bg-base px-4 py-3 text-sm text-ink/80">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={busy || hasSession === null}
            >
              {busy ? "Saving…" : "Save password and continue"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
