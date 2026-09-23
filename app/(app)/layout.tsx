import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { GradientShell } from "@/components/GradientShell";
import { SearchProvider } from "@/components/GlobalSearch";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shared with the page via cache(), so this costs no extra lookups.
  const { user, isAdmin } = await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <SearchProvider>
      <div className="flex min-h-screen">
        <Sidebar email={user.email ?? ""} isAdmin={isAdmin} />
        <GradientShell variant="app">
          <div className="relative z-[1] flex min-h-screen flex-1 flex-col">
            <main className="page-enter mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10">
              {children}
            </main>
            <footer className="px-6 pb-8 text-center text-[11px] text-muted sm:px-10">
              Internal member portal — keep member information confidential
            </footer>
          </div>
        </GradientShell>
      </div>
    </SearchProvider>
  );
}
