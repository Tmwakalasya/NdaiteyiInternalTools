// The Esinet Ndaiteyi mark: mountain range + ore diamond on the accent tile.
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
      <path d="M10 46 L25 21 L33.5 34.5 L40 24.5 L54 46 Z" fill="#ffffff" />
      <path
        d="M10 46 L25 21 L31 30.5 L22 46 Z"
        fill="#ffffff"
        opacity="0.72"
      />
      <path d="M47 12 L51.5 16.5 L47 21 L42.5 16.5 Z" fill="#ffffff" />
    </svg>
  );
}
