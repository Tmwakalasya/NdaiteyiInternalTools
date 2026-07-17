"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/Logo";
import { GradientShell } from "@/components/GradientShell";
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
    <GradientShell variant="hero">
      <main className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6 py-16">
        <LogoMark className="mb-6 h-10 w-10 text-xs" />

        <div className="text-center">
          {mode === "login" ? (
            <>
              <p className="text-lg text-white/70">Sign in to</p>
              <h1 className="display-title mt-1 text-white">
                <span className="emph">{site.name}</span>
              </h1>
            </>
          ) : (
            <h1 className="display-title text-white">Reset your password</h1>
          )}
          <p className="mt-3 text-[15px] text-white/45">
            {mode === "login"
              ? site.tagline
              : "We'll email you a link to set a new password."}
          </p>
        </div>

        <div className="card-glass mt-6 w-full max-w-md p-3 sm:p-4">
          {supabaseNotConfigured && (
            <p className="mb-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
              The site isn&rsquo;t connected to its database yet. Follow steps
              1&ndash;4 in the README, then signing in will work.
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              id="email"
              type="email"
              className="input-glass"
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
                className="input-glass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
            )}

            {message && (
              <p className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/75">
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
          className="mt-5 text-sm text-white/40 transition hover:text-white/70"
          onClick={() => {
            setMode(mode === "login" ? "reset" : "login");
            setMessage(null);
          }}
        >
          {mode === "login" ? "Forgotten your password?" : "Back to sign in"}
        </button>
      </main>
    </GradientShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
