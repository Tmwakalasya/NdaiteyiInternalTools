// ENM mark — soft gradient tile, Lovable-style.
export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 ${className ?? ""}`}
      role="img"
      aria-label="ENM Mining Consortium logo"
    >
      <span className="text-[0.55em] font-semibold tracking-tight text-white">
        ENM
      </span>
    </div>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-semibold">ENM</span>
      <span className="text-muted"> Mining Consortium</span>
    </span>
  );
}
