"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/config";

// True until the real Supabase keys are pasted into .env.local.
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
      : null
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
            : "That email and password don't match. Please try again."
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
          : "Check your email — we've sent you a link to set a new password."
      );
      setBusy(false);
    }
  }

  return (
    <main className="relative z-[1] flex flex-1 items-center justify-center p-6">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="card w-full max-w-md p-8 sm:p-10">
        <LogoMark className="mb-6 h-10 w-10" />
        <p className="mono-label mb-3">Mining Consortium — Member portal</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Esinet <span className="emph">Ndaiteyi</span>
        </h1>
        <p className="mt-2.5 text-sm text-muted">
          {mode === "login"
            ? "Sign in to continue."
            : "We'll email you a link to set a new password."}
        </p>

        {supabaseNotConfigured && (
          <p className="mt-6 rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent">
            The site isn&rsquo;t connected to its database yet. Follow steps
            1&ndash;4 in the README (create the Supabase project and paste its
            keys into <span className="font-mono text-xs">.env.local</span>),
            then signing in will work.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          {mode === "login" && (
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          )}

          {message && (
            <p className="rounded-xl border border-line bg-base px-4 py-3 text-sm text-ink/80">
              {message}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy
              ? "One moment…"
              : mode === "login"
                ? "Sign in"
                : "Email me the link"}
          </button>
        </form>

        <button
          type="button"
          className="mt-5 w-full text-center text-sm text-muted underline-offset-4 transition hover:text-ink hover:underline"
          onClick={() => {
            setMode(mode === "login" ? "reset" : "login");
            setMessage(null);
          }}
        >
          {mode === "login" ? "Forgotten your password?" : "Back to sign in"}
        </button>

        <p className="mono-label mt-10 text-center opacity-70">
          {site.tagline}
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
