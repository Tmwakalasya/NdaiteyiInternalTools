"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  House,
  Layers,
  LogOut,
  Mountain,
  Newspaper,
  Plus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/config";

const links = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/members", label: "Members", icon: Users },
  { href: "/projects", label: "Projects", icon: Layers },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/news", label: "News", icon: Newspaper },
];

const adminLinks = [
  { href: "/members/new", label: "Add member", icon: Plus },
  { href: "/news/new", label: "Post an update", icon: Plus },
];

export function Sidebar({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

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
      <Link
        href={href}
        className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
          active
            ? "bg-ink/[0.06] font-medium text-ink"
            : "text-muted hover:bg-ink/[0.04] hover:text-ink"
        }`}
      >
        {active && (
          <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-ink" />
        )}
        <Icon size={17} strokeWidth={2} />
        {label}
      </Link>
    );
  }

  return (
    <aside className="sticky top-0 z-10 flex h-screen w-64 shrink-0 flex-col border-r border-line bg-card px-4 py-5">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
          <Mountain size={16} strokeWidth={2.25} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          {site.name}
        </span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {links.map((link) => (
          <NavLink key={link.href} {...link} exact={link.href === "/dashboard"} />
        ))}
      </nav>

      {isAdmin && (
        <>
          <p className="mono-label mt-8 px-3">Admin</p>
          <nav className="mt-2 flex flex-col gap-1">
            {adminLinks.map((link) => (
              <NavLink key={link.href} {...link} exact />
            ))}
          </nav>
        </>
      )}

      <div className="mt-auto border-t border-line pt-4">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-base">
            {email[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{email}</p>
            {isAdmin && (
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                Admin
              </p>
            )}
          </div>
          <ThemeToggle />
          <button
            onClick={signOut}
            title="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-ink/[0.05] hover:text-danger"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
