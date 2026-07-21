import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2, Download, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import {
  complianceSummary,
  getComplianceOverview,
} from "@/lib/compliance";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default async function CompliancePage() {
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) redirect("/dashboard");

  const supabase = await createClient();
  const rows = await getComplianceOverview(supabase);
  const summary = complianceSummary(rows);
  const incomplete = rows
    .filter((r) => r.percent < 100)
    .sort((a, b) => a.percent - b.percent);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Schedule 1"
        title="Compliance"
        description="Track Schedule 1 due-diligence document completion across the consortium directory."
        action={
          <a href="/api/compliance/export" className="btn-secondary">
            <Download size={16} /> Export report
          </a>
        }
      />

      <div className="hero-metric grid gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <p className="section-label text-white/60">Consortium average</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {summary.averagePercent}%
          </p>
          <p className="mt-2 text-sm text-white/60">
            Schedule 1 completion across {summary.total}{" "}
            {summary.total === 1 ? "member" : "members"}
          </p>
        </div>
        <div className="flex flex-col justify-end gap-3 sm:items-end">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <span className="text-white/60">Fully compliant</span>
            <p className="mt-1 text-xl font-semibold text-white">
              {summary.fullyCompliant}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <span className="text-white/60">Incomplete</span>
            <p className="mt-1 text-xl font-semibold text-white">
              {summary.incomplete}
            </p>
          </div>
        </div>
      </div>

      {incomplete.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="section-label mb-1">Action needed</p>
              <h2 className="text-xl font-semibold tracking-tight">
                Missing documents
              </h2>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {incomplete.slice(0, 6).map((row) => (
              <Link
                key={row.memberId}
                href={`/members/${row.memberId}`}
                className="card-interactive block p-5"
              >
                <div className="flex items-start gap-4">
                  <Avatar name={row.fullName} photoUrl={null} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold tracking-tight">
                        {row.fullName}
                      </h3>
                      <span className="badge shrink-0">
                        {row.percent}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {row.providedCount}/{row.totalRequired} documents ·{" "}
                      {row.missing.length} missing
                    </p>
                    <ul className="mt-3 space-y-1">
                      {row.missing.slice(0, 3).map((m) => (
                        <li
                          key={m.key}
                          className="flex items-center gap-2 text-xs text-muted"
                        >
                          <AlertCircle size={12} className="shrink-0 text-amber-500" />
                          {m.label}
                        </li>
                      ))}
                      {row.missing.length > 3 && (
                        <li className="text-xs text-muted">
                          +{row.missing.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4">
          <p className="section-label mb-1">Directory</p>
          <h2 className="text-xl font-semibold tracking-tight">
            All members
          </h2>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No members yet"
            description="Add members to the directory to track Schedule 1 compliance."
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-panel/50">
                    <th className="px-5 py-3 font-medium text-muted">Member</th>
                    <th className="px-5 py-3 font-medium text-muted">Progress</th>
                    <th className="px-5 py-3 font-medium text-muted">Status</th>
                    <th className="px-5 py-3 font-medium text-muted">Missing</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.memberId} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-4">
                        <Link
                          href={`/members/${row.memberId}`}
                          className="font-medium hover:underline"
                        >
                          {row.fullName}
                        </Link>
                        {row.organisation && (
                          <p className="mt-0.5 text-xs text-muted">
                            {row.organisation}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="progress-track w-24">
                            <div
                              className="progress-fill"
                              style={{ width: `${row.percent}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-muted">
                            {row.percent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {row.percent === 100 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle2 size={14} /> Complete
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">
                            {row.providedCount}/{row.totalRequired} docs
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted">
                        {row.missing.length === 0
                          ? "—"
                          : row.missing.map((m) => m.label).join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
