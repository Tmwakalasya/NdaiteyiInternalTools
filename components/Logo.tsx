// ENM mark — a rust tile, matching the homepage accent.
export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-[4px] bg-rust ${className ?? ""}`}
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
    <span className={`tracking-[-0.03em] ${className ?? ""}`}>
      <span className="font-semibold">enm</span>
      <span className="opacity-55">consortium</span>
    </span>
  );
}
