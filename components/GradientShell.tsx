// Full-viewport gradient backgrounds for auth pages and the signed-in app shell.
export function GradientShell({
  variant = "app",
  children,
}: {
  variant?: "hero" | "app";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex min-h-full flex-1 flex-col ${variant === "hero" ? "gradient-hero" : "gradient-app"}`}
    >
      {children}
    </div>
  );
}
