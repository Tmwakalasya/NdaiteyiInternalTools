"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  House,
  Layers,
  LogOut,
  Newspaper,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { NotificationBell } from "@/components/NotificationBell";
import { useGlobalSearch } from "@/components/GlobalSearch";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/config";

const links = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/members", label: "Members", icon: Users },
  { href: "/projects", label: "Projects", icon: Layers },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/news", label: "News", icon: Newspaper },
];

const adminLinks = [
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/members/new", label: "Add member", icon: Plus },
  { href: "/news/new", label: "Post an update", icon: Plus },
];

export function Sidebar({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { openSearch } = useGlobalSearch();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function NavLink({
    href,
    label,
    icon: Icon,
    exact = false,
  }: {
    href: string;
    label: string;
    icon: typeof House;
    exact?: boolean;
  }) {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} className={`nav-link ${active ? "nav-active" : ""}`}>
        <Icon size={17} strokeWidth={1.75} />
        {label}
      </Link>
    );
  }

  return (
    <aside className="sidebar-solid sticky top-0 z-10 flex h-screen w-64 shrink-0 flex-col overflow-visible px-3 py-5">
      <div className="flex items-center gap-2 px-3 py-2">
        <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2.5">
          <LogoMark className="h-8 w-8 shrink-0 text-xs" />
          <span className="min-w-0 truncate text-sm font-semibold leading-snug tracking-tight">
            {site.name}
          </span>
        </Link>
        <NotificationBell />
      </div>

      <nav className="mt-6 flex flex-col gap-0.5">
        <button
          type="button"
          onClick={openSearch}
          className="nav-link w-full text-left"
        >
          <Search size={17} strokeWidth={1.75} />
          Search
          <kbd className="ml-auto hidden rounded border border-line bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted lg:inline">
            ⌘K
          </kbd>
        </button>
        {links.map((link) => (
          <NavLink key={link.href} {...link} exact={link.href === "/dashboard"} />
        ))}
      </nav>

      {isAdmin && (
        <>
          <p className="section-label mt-8 px-3">Admin</p>
          <nav className="mt-2 flex flex-col gap-0.5">
            {adminLinks.map((link) => (
              <NavLink key={link.href} {...link} exact />
            ))}
          </nav>
        </>
      )}

      <div className="mt-auto px-2 pt-4">
        <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-panel p-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 text-xs font-semibold text-white ring-2 ring-indigo-200 ring-offset-2 ring-offset-surface">
            {email[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{email}</p>
            {isAdmin && <p className="text-[11px] text-muted">Admin</p>}
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-danger"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
