import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Sends a Supabase invitation email so a member can create a login.
// Only administrators may call this.
export async function POST(request: NextRequest) {
  const { isAdmin } = await getSessionProfile();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can send invitations." },
      { status: 403 }
    );
  }

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "An email address is required." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${request.nextUrl.origin}/auth/confirm?next=/set-password`,
  });

  if (error) {
    const alreadyInvited = error.message.toLowerCase().includes("already");
    return NextResponse.json(
      {
        error: alreadyInvited
          ? "This person already has an account or a pending invitation."
          : `The invitation could not be sent: ${error.message}`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
