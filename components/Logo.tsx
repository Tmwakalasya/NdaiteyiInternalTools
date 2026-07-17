// The Esinet Ndaiteyi mark: the ore diamond on the accent tile.
// Colors come from the theme variables, so it adapts to light/dark mode.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Esinet Ndaiteyi logo"
    >
      <rect width="64" height="64" rx="14" fill="var(--color-accent)" />
      <path d="M32 14 L50 32 L32 50 L14 32 Z" fill="#ffffff" />
      <path d="M32 14 L50 32 L32 32 Z" fill="#ffffff" opacity="0.6" />
      <path d="M32 32 L32 50 L14 32 Z" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}
