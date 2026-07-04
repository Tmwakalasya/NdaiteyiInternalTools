import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import type { Profile } from "@/lib/types";

// Wraps every signed-in page: sidebar on the left, content on the right.
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
    <div className="relative z-[1] flex min-h-screen">
      <Sidebar email={user.email ?? ""} isAdmin={profile?.role === "admin"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-10">
          {children}
        </main>
        <footer className="px-6 py-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:px-10">
          Internal member portal — keep member information confidential
        </footer>
      </div>
    </div>
  );
}
