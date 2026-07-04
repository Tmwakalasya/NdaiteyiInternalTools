import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} /> All projects
      </Link>
      <div>
        <p className="mono-label mb-3">Transactions</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          New project
        </h1>
        <p className="mt-2 text-muted">
          Give the deal a name — the SEZ phases are added for you.
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
