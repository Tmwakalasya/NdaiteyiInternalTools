import { redirect } from "next/navigation";

// The proxy sends signed-out visitors to /login,
// so anyone who reaches this page belongs on the dashboard.
export default function Home() {
  redirect("/dashboard");
}
