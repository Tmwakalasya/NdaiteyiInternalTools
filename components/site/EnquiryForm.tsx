"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { interestLabel } from "@/lib/enquiries";
import type { EnquiryInterest } from "@/lib/types";

const interests = Object.keys(interestLabel) as EnquiryInterest[];

// Public enquiry form on the homepage. Posts to /api/enquiries, which
// validates, filters bots and rate-limits before saving.
export function EnquiryForm() {
  const startedAt = useRef(0);
  const [interest, setInterest] = useState<EnquiryInterest>("buying");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, interest, startedAt: startedAt.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="border-t border-white/10 pt-10" role="status">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rust">
          <Check size={18} />
        </span>
        <p className="mt-6 text-[clamp(24px,3vw,34px)] leading-tight tracking-[-0.03em]">
          Thank you. Your enquiry is with us<span className="text-rust">.</span>
        </p>
        <p className="mt-3 max-w-[48ch] text-[15px] text-white/55">
          A consortium member will review it and reply by email. Every
          introduction starts with party identification, so expect a few
          questions about who you represent.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-2">
      <fieldset className="sm:col-span-2">
        <legend className="site-eyebrow mb-3 text-white/55">I&rsquo;m looking to</legend>
        <div className="flex flex-wrap gap-2">
          {interests.map((key) => (
            <label key={key} className="cursor-pointer">
              <input
                type="radio"
                name="interest-choice"
                value={key}
                checked={interest === key}
                onChange={() => setInterest(key)}
                className="peer sr-only"
              />
              <span className="inline-flex rounded-full border border-white/20 px-4 py-2 text-[14px] text-white/70 transition peer-checked:border-white peer-checked:bg-white peer-checked:text-coal peer-focus-visible:ring-2 peer-focus-visible:ring-rust hover:border-white/50">
                {interestLabel[key]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field name="full_name" label="Your name" required autoComplete="name" maxLength={200} />
      <Field name="company" label="Company" autoComplete="organization" maxLength={200} />
      <Field name="email" label="Email" type="email" required autoComplete="email" maxLength={320} />
      <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" maxLength={50} />
      <Field name="commodity" label="Commodity" placeholder="e.g. Copper cathode, 10,000 t/month" maxLength={200} />
      <Field name="country" label="Country" autoComplete="country-name" maxLength={100} />

      <label className="sm:col-span-2">
        <span className="mb-2 block text-[13px] text-white/55">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          placeholder="Specifications, quantities, timelines, and who you represent."
          className="input-dark resize-y"
        />
      </label>

      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[52ch] text-[13px] text-white/45">
          We use these details only to respond to your enquiry. They&rsquo;re
          seen by consortium administrators, never shared or sold.
        </p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-coal transition hover:bg-rust hover:text-white disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send enquiry"} <ArrowUpRight size={16} />
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-[4px] border border-rust/40 bg-rust/15 px-4 py-3 text-[14px] text-white sm:col-span-2">
          {error}
        </p>
      )}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label>
      <span className="mb-2 block text-[13px] text-white/55">
        {label}
        {rest.required && <span className="text-rust"> *</span>}
      </span>
      <input name={name} type={type} className="input-dark" {...rest} />
    </label>
  );
}
