"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/Avatar";
import type { Member } from "@/lib/types";

// One form for both "Add member" and "Edit member".
export function MemberForm({ member }: { member?: Member }) {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: member?.full_name ?? "",
    country: member?.country ?? "",
    title: member?.title ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    organisation: member?.organisation ?? "",
    role_in_transaction: member?.role_in_transaction ?? "",
    bio: member?.bio ?? "",
    responsibilities: member?.responsibilities ?? "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    member?.photo_url ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();

    let photo_url = member?.photo_url ?? null;

    // Upload the photo first, if a new one was chosen.
    if (photoFile) {
      const path = `${crypto.randomUUID()}-${photoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, photoFile);
      if (uploadError) {
        setError("The photo could not be uploaded. Please try a smaller image.");
        setBusy(false);
        return;
      }
      photo_url = supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
    }

    // Empty text boxes are saved as "no value" rather than empty text.
    const values = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()])
    );

    const { data, error: saveError } = member
      ? await supabase
          .from("members")
          .update({ ...values, photo_url })
          .eq("id", member.id)
          .select()
          .single()
      : await supabase
          .from("members")
          .insert({ ...values, photo_url })
          .select()
          .single();

    if (saveError || !data) {
      setError(
        "The member could not be saved. Check you are signed in as an administrator and try again."
      );
      setBusy(false);
      return;
    }

    router.push(`/members/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6 sm:p-8">
      <div className="flex items-center gap-5">
        <Avatar
          name={form.full_name || "New Member"}
          photoUrl={photoPreview}
          size="lg"
        />
        <div>
          <label className="label" htmlFor="photo">
            Photo (optional)
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="block text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-accent hover:file:text-white"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setPhotoFile(file);
              if (file) setPhotoPreview(URL.createObjectURL(file));
            }}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="full_name">
            Full name *
          </label>
          <input
            id="full_name"
            className="input"
            value={form.full_name}
            onChange={set("full_name")}
            required
            placeholder="e.g. Stanley Nuahnbolee Mahn"
          />
        </div>

        <div>
          <label className="label" htmlFor="country">
            Country
          </label>
          <input
            id="country"
            className="input"
            value={form.country}
            onChange={set("country")}
            placeholder="e.g. Liberia"
          />
        </div>

        <div>
          <label className="label" htmlFor="title">
            Profession / designation
          </label>
          <input
            id="title"
            className="input"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Commodities Broker"
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={set("email")}
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            className="input"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+260 …"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="organisation">
            Organisation represented
          </label>
          <input
            id="organisation"
            className="input"
            value={form.organisation}
            onChange={set("organisation")}
            placeholder="e.g. HMZ Holdings Zambia Ltd. (Director)"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="role_in_transaction">
            Role in transaction
          </label>
          <input
            id="role_in_transaction"
            className="input"
            value={form.role_in_transaction}
            onChange={set("role_in_transaction")}
            placeholder="e.g. Commodity Broker for seller/buyer"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="bio">
            CV / background
          </label>
          <textarea
            id="bio"
            className="textarea min-h-32"
            value={form.bio}
            onChange={set("bio")}
            placeholder="A few sentences about this person's background…"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="responsibilities">
            Potential areas of responsibility
          </label>
          <textarea
            id="responsibilities"
            className="textarea min-h-20"
            value={form.responsibilities}
            onChange={set("responsibilities")}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-3 border-t border-line pt-6">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : member ? "Save changes" : "Add member"}
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
