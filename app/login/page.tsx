"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { site } from "@/lib/config";

const supabaseNotConfigured =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(
    searchParams.get("error") === "link"
      ? "That link has expired or was already used. Please request a new one."
      : null,
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        const cantReach =
          error.name === "AuthRetryableFetchError" ||
          error.message.toLowerCase().includes("fetch");
        setMessage(
          cantReach
            ? "The database can't be reached. If this site was just set up, the Supabase keys in .env.local still need to be filled in (README, steps 1–4)."
            : "That email and password don't match. Please try again.",
        );
        setBusy(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/set-password`,
      });
      setMessage(
        error
          ? "Something went wrong. Please try again in a minute."
          : "Check your email — we've sent you a link to set a new password.",
      );
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow={mode === "login" ? "Member portal" : "Password reset"}
      title={
        mode === "login" ? (
          <>
            Welcome back<span className="text-rust">.</span>
          </>
        ) : (
          <>
            Reset your password<span className="text-rust">.</span>
          </>
        )
      }
      description={
        mode === "login"
          ? `Sign in to the ${site.name} member portal.`
          : "We'll email you a link to set a new password."
      }
    >
      <div>
        {supabaseNotConfigured && (
          <p className="mb-3 rounded-[4px] border border-amber-700/20 bg-amber-600/[0.07] px-4 py-3 text-sm text-amber-900">
            The site isn&rsquo;t connected to its database yet. Follow steps
            1&ndash;4 in the README, then signing in will work.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            autoComplete="email"
          />

          {mode === "login" && (
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
          )}

          {message && (
            <p className="rounded-[4px] bg-panel px-4 py-3 text-sm text-ink/80">
              {message}
            </p>
          )}

          <button type="submit" className="btn-primary-hero" disabled={busy}>
            {busy
              ? "One moment…"
              : mode === "login"
                ? "Sign in"
                : "Email me the link"}
          </button>
        </form>
      </div>

      <button
        type="button"
        className="mt-5 block text-sm text-muted underline-offset-4 transition hover:text-ink hover:underline"
        onClick={() => {
          setMode(mode === "login" ? "reset" : "login");
          setMessage(null);
        }}
      >
        {mode === "login" ? "Forgotten your password?" : "Back to sign in"}
      </button>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
