import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { GradientShell } from "@/components/GradientShell";
import type { Profile } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return (
    <div className="flex min-h-screen">
      <Sidebar email={user.email ?? ""} isAdmin={profile?.role === "admin"} />
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
  );
}
