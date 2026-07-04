"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

// Edit / complete / delete controls at the top of a project page.
export function ProjectActions({ project }: { project: Project }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const completed = project.status === "completed";

  async function setStatus(status: Project["status"]) {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("projects").update({ status }).eq("id", project.id);
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    const sure = window.confirm(
      `Delete “${project.name}” and its whole checklist? This cannot be undone.`
    );
    if (!sure) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);
    if (error) {
      window.alert("The project could not be deleted. Please try again.");
      setBusy(false);
      return;
    }
    router.push("/projects");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {completed ? (
        <button
          onClick={() => setStatus("active")}
          className="btn-secondary"
          disabled={busy}
        >
          <RotateCcw size={15} /> Reopen
        </button>
      ) : (
        <button
          onClick={() => setStatus("completed")}
          className="btn-primary"
          disabled={busy}
        >
          <CheckCircle2 size={15} /> Mark project complete
        </button>
      )}
      <Link href={`/projects/${project.id}/edit`} className="btn-secondary">
        <Pencil size={15} /> Edit
      </Link>
      <button onClick={remove} className="btn-danger" disabled={busy}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}
