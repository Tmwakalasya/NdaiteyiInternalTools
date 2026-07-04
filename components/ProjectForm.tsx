"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

// One form for both "New project" and "Edit project".
export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const editing = !!project;
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (editing) {
      const supabase = createClient();
      const { error: saveError } = await supabase
        .from("projects")
        .update({ name: name.trim(), description: description.trim() || null })
        .eq("id", project!.id);
      if (saveError) {
        setError("The changes could not be saved. Please try again.");
        setBusy(false);
        return;
      }
      router.push(`/projects/${project!.id}`);
      router.refresh();
      return;
    }

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "The project could not be created.");
      setBusy(false);
      return;
    }
    router.push(`/projects/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
      <div>
        <label className="label" htmlFor="name">
          Project name *
        </label>
        <input
          id="name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Copper cathodes — DRC supplier / EU buyer"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="input min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Commodity, parties involved, and any notes about this deal…"
        />
      </div>

      {!editing && (
        <div className="flex items-start gap-3 rounded-xl border border-line bg-base p-4">
          <ListChecks size={18} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-muted">
            This project will start with the{" "}
            <span className="font-medium text-ink">
              SEZ Africa four-phase checklist
            </span>{" "}
            (Party Identification, Due Diligence, Confidentiality, Commercial
            Documentation). You can tick items off, mark phases complete, and add
            your own steps afterwards.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-3 border-t border-line pt-5">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save changes" : "Create project"}
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
