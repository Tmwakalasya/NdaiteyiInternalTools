import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { ProjectForm } from "@/components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <BackLink href="/projects">All projects</BackLink>
      <PageHeader
        eyebrow="Transactions"
        title="New project"
        description="Give the deal a name — the SEZ phases are added for you."
      />
      <ProjectForm />
    </div>
  );
}
