import type { SupabaseClient } from "@supabase/supabase-js";
import { requiredMemberDocuments } from "@/lib/config";
import type { MemberCompliance } from "@/lib/types";

export async function getComplianceOverview(
  supabase: SupabaseClient
): Promise<MemberCompliance[]> {
  const [{ data: members }, { data: docs }] = await Promise.all([
    supabase
      .from("members")
      .select("id, full_name, organisation, country")
      .order("full_name"),
    supabase.from("member_documents").select("member_id, doc_type"),
  ]);

  const docsByMember = new Map<string, Set<string>>();
  for (const doc of docs ?? []) {
    if (!docsByMember.has(doc.member_id)) {
      docsByMember.set(doc.member_id, new Set());
    }
    docsByMember.get(doc.member_id)!.add(doc.doc_type);
  }

  const totalRequired = requiredMemberDocuments.length;

  return (members ?? []).map((member) => {
    const provided = docsByMember.get(member.id) ?? new Set();
    const missing = requiredMemberDocuments.filter((r) => !provided.has(r.key));
    const providedCount = totalRequired - missing.length;
    const percent =
      totalRequired === 0
        ? 100
        : Math.round((providedCount / totalRequired) * 100);

    return {
      memberId: member.id,
      fullName: member.full_name,
      organisation: member.organisation,
      country: member.country,
      providedCount,
      totalRequired,
      percent,
      missing: missing.map((m) => ({ key: m.key, label: m.label })),
    };
  });
}

export function complianceSummary(rows: MemberCompliance[]) {
  if (rows.length === 0) {
    return { averagePercent: 0, fullyCompliant: 0, incomplete: 0, total: 0 };
  }
  const averagePercent = Math.round(
    rows.reduce((sum, r) => sum + r.percent, 0) / rows.length
  );
  const fullyCompliant = rows.filter((r) => r.percent === 100).length;
  return {
    averagePercent,
    fullyCompliant,
    incomplete: rows.length - fullyCompliant,
    total: rows.length,
  };
}

export function complianceToCsv(rows: MemberCompliance[]): string {
  const header =
    "Member,Organisation,Country,Provided,Required,Percent,Missing documents";
  const lines = rows.map((r) => {
    const missing = r.missing.map((m) => m.label).join("; ");
    return [
      csvCell(r.fullName),
      csvCell(r.organisation ?? ""),
      csvCell(r.country ?? ""),
      r.providedCount,
      r.totalRequired,
      `${r.percent}%`,
      csvCell(missing),
    ].join(",");
  });
  return [header, ...lines].join("\n");
}

function csvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
