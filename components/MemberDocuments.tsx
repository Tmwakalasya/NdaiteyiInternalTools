"use client";

import { useRef, useState } from "react";
import {
  Check,
  Download,
  FileText,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { requiredMemberDocuments } from "@/lib/config";
import type { MemberDocument } from "@/lib/types";

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

// Schedule 1 due-diligence uploads on a member's profile. Any signed-in
// member can upload; only admins and the uploader can view/download (enforced
// by row-level security + a private bucket).
export function MemberDocuments({
  memberId,
  initialDocuments,
}: {
  memberId: string;
  initialDocuments: MemberDocument[];
}) {
  const supabase = createClient();
  const [docs, setDocs] = useState<MemberDocument[]>(initialDocuments);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otherLabel, setOtherLabel] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<{ docType: string; label: string } | null>(null);

  const providedTypes = new Set(docs.map((d) => d.doc_type));
  const requiredProvided = requiredMemberDocuments.filter((r) =>
    providedTypes.has(r.key)
  ).length;
  const total = requiredMemberDocuments.length;
  const pct = Math.round((requiredProvided / total) * 100);

  function pickFile(docType: string, label: string) {
    setError(null);
    pendingRef.current = { docType, label };
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const pending = pendingRef.current;
    e.target.value = "";
    if (!file || !pending) return;

    setBusyKey(pending.docType === "other" ? "other" : pending.docType);
    setError(null);

    const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${memberId}/${crypto.randomUUID()}-${safe}`;
    const { error: upErr } = await supabase.storage
      .from("member-documents")
      .upload(path, file);
    if (upErr) {
      setError(
        "The file could not be uploaded. Make sure migration 03 has been run, then try again."
      );
      setBusyKey(null);
      return;
    }

    const { data, error: insErr } = await supabase
      .from("member_documents")
      .insert({
        member_id: memberId,
        doc_type: pending.docType,
        label: pending.label,
        storage_path: path,
        file_name: file.name,
        size_bytes: file.size,
        mime_type: file.type || null,
      })
      .select()
      .single<MemberDocument>();

    if (insErr || !data) {
      setError("The file uploaded but could not be recorded. Please try again.");
      setBusyKey(null);
      return;
    }

    setDocs((prev) => [data, ...prev]);
    if (pending.docType === "other") setOtherLabel("");
    setBusyKey(null);
  }

  async function download(doc: MemberDocument) {
    const { data, error } = await supabase.storage
      .from("member-documents")
      .createSignedUrl(doc.storage_path, 3600);
    if (error || !data) {
      window.alert("This file could not be opened. Please try again.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function remove(doc: MemberDocument) {
    if (!window.confirm(`Delete “${doc.file_name}”? This cannot be undone.`))
      return;
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    await supabase.storage.from("member-documents").remove([doc.storage_path]);
    await supabase.from("member_documents").delete().eq("id", doc.id);
  }

  function FileRow({ doc }: { doc: MemberDocument }) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line bg-base px-3 py-2">
        <FileText size={15} className="shrink-0 text-muted" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{doc.file_name}</p>
          <p className="truncate font-mono text-[11px] text-muted">
            {[
              formatBytes(doc.size_bytes),
              new Date(doc.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <button
          onClick={() => download(doc)}
          title="Download"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-card hover:text-ink"
        >
          <Download size={16} />
        </button>
        <button
          onClick={() => remove(doc)}
          title="Delete"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>
    );
  }

  const otherDocs = docs.filter((d) => d.doc_type === "other");

  return (
    <div className="card p-6 sm:p-8">
      {/* Hidden input shared by every upload button */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mono-label mb-2">Schedule 1</p>
          <h2 className="text-lg font-semibold tracking-tight">
            Due-diligence documents
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck size={13} className="text-accent" />
            Private — visible only to you and administrators.
          </p>
        </div>
        <span className="font-mono text-sm text-muted">
          {requiredProvided}/{total}
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <ul className="mt-6 space-y-5">
        {requiredMemberDocuments.map((req) => {
          const forType = docs.filter((d) => d.doc_type === req.key);
          const provided = forType.length > 0;
          const busy = busyKey === req.key;
          return (
            <li key={req.key}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        provided
                          ? "border-accent bg-accent text-white"
                          : "border-line-strong text-muted"
                      }`}
                    >
                      {provided && <Check size={12} strokeWidth={3} />}
                    </span>
                    <h3 className="text-sm font-medium">{req.label}</h3>
                  </div>
                  {req.hint && (
                    <p className="ml-7 mt-0.5 text-xs text-muted">{req.hint}</p>
                  )}
                </div>
                <button
                  onClick={() => pickFile(req.key, req.label)}
                  disabled={busy}
                  className="btn-secondary shrink-0 px-3 py-1.5 text-xs"
                >
                  <Upload size={13} />
                  {busy ? "Uploading…" : provided ? "Add another" : "Upload"}
                </button>
              </div>
              {forType.length > 0 && (
                <div className="ml-7 mt-2 space-y-2">
                  {forType.map((doc) => (
                    <FileRow key={doc.id} doc={doc} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Other / additional documents */}
      <div className="mt-8 border-t border-line pt-5">
        <h3 className="text-sm font-medium">Other documents</h3>
        {otherDocs.length > 0 && (
          <div className="mt-3 space-y-2">
            {otherDocs.map((doc) => (
              <FileRow key={doc.id} doc={doc} />
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={otherLabel}
            onChange={(e) => setOtherLabel(e.target.value)}
            placeholder="Document name (e.g. Tax clearance)"
            className="input max-w-xs flex-1 py-2 text-sm"
          />
          <button
            onClick={() => pickFile("other", otherLabel.trim() || "Other document")}
            disabled={busyKey === "other" || otherLabel.trim() === ""}
            className="btn-secondary shrink-0 px-3 py-2 text-xs"
          >
            <Plus size={14} />
            {busyKey === "other" ? "Uploading…" : "Add file"}
          </button>
        </div>
      </div>
    </div>
  );
}
