"use client";

import { useState } from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/EmptyState";
import type { Document } from "@/lib/types";

type ProjectRef = { id: string; name: string };

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u++;
  }
  return `${n.toFixed(n >= 10 || u === 0 ? 0 : 1)} ${units[u]}`;
}

// Upload / list / download / delete files in the private "documents" bucket.
// Used on the Documents page (with a project picker) and inside a project
// (locked to that project).
export function DocumentsPanel({
  initialDocuments,
  projects = [],
  fixedProjectId,
}: {
  initialDocuments: Document[];
  projects?: ProjectRef[];
  fixedProjectId?: string;
}) {
  const supabase = createClient();
  const [docs, setDocs] = useState<Document[]>(initialDocuments);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(fixedProjectId ?? "");
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);

    const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${crypto.randomUUID()}-${safe}`;
    const { error: upErr } = await supabase.storage
      .from("documents")
      .upload(path, file);
    if (upErr) {
      setError(
        "The file could not be uploaded. Make sure the database migration has been run, then try again."
      );
      setBusy(false);
      return;
    }

    const { data, error: insErr } = await supabase
      .from("documents")
      .insert({
        name: name.trim() || file.name,
        storage_path: path,
        size_bytes: file.size,
        mime_type: file.type || null,
        project_id: fixedProjectId ?? (projectId || null),
      })
      .select()
      .single<Document>();

    if (insErr || !data) {
      setError("The file uploaded but could not be recorded. Please try again.");
      setBusy(false);
      return;
    }

    setDocs((prev) => [data, ...prev]);
    setFile(null);
    setName("");
    if (!fixedProjectId) setProjectId("");
    setFileKey((k) => k + 1);
    setBusy(false);
  }

  async function download(doc: Document) {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 3600);
    if (error || !data) {
      window.alert("This file could not be opened. Please try again.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function remove(doc: Document) {
    if (!window.confirm(`Delete “${doc.name}”? This cannot be undone.`)) return;
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    await supabase.storage.from("documents").remove([doc.storage_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
  }

  return (
    <div className="space-y-4">
      {/* Upload */}
      <form onSubmit={upload} className="card space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="file">
              Choose a file *
            </label>
            <input
              id="file"
              key={fileKey}
              type="file"
              required
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f && !name) setName(f.name);
              }}
              className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-accent hover:file:text-white"
            />
          </div>
          <div>
            <label className="label" htmlFor="docname">
              Display name
            </label>
            <input
              id="docname"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional — defaults to the file name"
            />
          </div>
        </div>

        {!fixedProjectId && projects.length > 0 && (
          <div>
            <label className="label" htmlFor="docproject">
              Link to a project (optional)
            </label>
            <select
              id="docproject"
              className="input"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={busy || !file}>
          <Upload size={15} /> {busy ? "Uploading…" : "Upload file"}
        </button>
      </form>

      {/* List */}
      {docs.length > 0 ? (
        <ul className="card divide-y divide-line overflow-hidden">
          {docs.map((doc) => {
            const projectName =
              projects.find((p) => p.id === doc.project_id)?.name ?? null;
            return (
              <li key={doc.id} className="document-row">
                <span className="icon-tile h-10 w-10 shrink-0">
                  <FileText size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{doc.name}</p>
                  <p className="truncate font-mono text-xs text-muted">
                    {[
                      formatBytes(doc.size_bytes),
                      new Date(doc.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }),
                      projectName,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => download(doc)}
                  title="Download"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-white/[0.06] hover:text-ink"
                >
                  <Download size={17} />
                </button>
                <button
                  onClick={() => remove(doc)}
                  title="Delete"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={FileText}
          title="No files uploaded yet"
          description="Upload a document to share it with consortium members."
        />
      )}
    </div>
  );
}
