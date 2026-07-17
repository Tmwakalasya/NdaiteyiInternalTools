import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

const tileClass = {
  indigo: "metric-tile-indigo",
  violet: "metric-tile-violet",
  slate: "metric-tile-slate",
  rose: "metric-tile-rose",
} as const;

export function StatCard({
  href,
  label,
  count,
  detail,
  icon: Icon,
  variant = "slate",
}: {
  href: string;
  label: string;
  count: number | null;
  detail?: string;
  icon: LucideIcon;
  variant?: keyof typeof tileClass;
}) {
  return (
    <Link href={href} className="card-interactive group flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={tileClass[variant]}>
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <ArrowUpRight
          size={16}
          className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
        />
      </div>
      <div>
        <p className="stat-value">{count ?? 0}</p>
        <p className="mt-1 text-sm font-medium">{label}</p>
        {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
      </div>
    </Link>
  );
}
