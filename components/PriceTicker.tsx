import type { MetalPrices, MetalQuote } from "@/lib/prices";

// Scrolling strip of indicative metal prices. Renders nothing when there
// are no prices, so a missing key or a feed outage just hides it.
export function PriceTicker({
  prices,
  tone = "dark",
}: {
  prices: MetalPrices | null;
  tone?: "dark" | "light";
}) {
  if (!prices) return null;

  const dark = tone === "dark";
  const updated = new Date(prices.updatedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return (
    <section
      aria-label="Indicative metal prices"
      className={`flex items-stretch overflow-hidden border-y text-[13px] ${
        dark
          ? "border-white/10 bg-coal text-white"
          : "rounded-[4px] border-x border-line bg-surface text-ink"
      }`}
    >
      <div
        className={`z-[1] flex shrink-0 flex-col justify-center gap-0.5 border-r px-4 py-3 sm:px-6 ${
          dark ? "border-white/10 bg-coal" : "border-line bg-surface"
        }`}
      >
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-rust" />
          Metals · USD
        </span>
        <span className={`text-[11px] ${dark ? "text-white/45" : "text-muted"}`}>
          Indicative · {updated} UTC
        </span>
      </div>

      <div className="ticker relative min-w-0 flex-1">
        <div className="ticker-track flex w-max">
          <QuoteList quotes={prices.quotes} dark={dark} />
          {/* Second copy makes the loop seamless; hidden from screen readers */}
          <QuoteList quotes={prices.quotes} dark={dark} hidden />
        </div>
      </div>

      <a
        href="https://metals.dev"
        target="_blank"
        rel="noreferrer"
        className={`hidden shrink-0 items-center border-l px-4 font-mono text-[10px] tracking-[0.14em] uppercase transition md:flex ${
          dark
            ? "border-white/10 text-white/40 hover:text-white"
            : "border-line text-muted hover:text-ink"
        }`}
      >
        Metals.Dev
      </a>
    </section>
  );
}

function QuoteList({
  quotes,
  dark,
  hidden = false,
}: {
  quotes: MetalQuote[];
  dark: boolean;
  hidden?: boolean;
}) {
  return (
    <ul className="flex shrink-0" aria-hidden={hidden || undefined}>
      {quotes.map((q) => (
        <li
          key={q.key}
          className={`flex items-baseline gap-2 border-r px-5 py-3 whitespace-nowrap ${
            dark ? "border-white/10" : "border-line"
          }`}
        >
          <span className={dark ? "text-white/60" : "text-muted"}>{q.label}</span>
          <span className="font-mono tabular-nums">{formatPrice(q.price)}</span>
          <span className={`font-mono text-[11px] ${dark ? "text-white/35" : "text-muted/80"}`}>
            /{q.unit}
          </span>
          {q.changePercent !== null && <Change value={q.changePercent} dark={dark} />}
        </li>
      ))}
    </ul>
  );
}

function Change({ value, dark }: { value: number; dark: boolean }) {
  const rounded = Math.round(value * 100) / 100;
  if (rounded === 0) {
    return <span className={`font-mono text-[11px] ${dark ? "text-white/45" : "text-muted"}`}>0.00%</span>;
  }
  const up = rounded > 0;
  const color = up
    ? dark
      ? "text-[#9cc68a]"
      : "text-emerald-800"
    : dark
      ? "text-[#e38b74]"
      : "text-rust";
  return (
    <span className={`font-mono text-[11px] tabular-nums ${color}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "up" : "down"}</span> {Math.abs(rounded).toFixed(2)}%
    </span>
  );
}

function formatPrice(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 1000 ? 0 : 2,
    minimumFractionDigits: n >= 1000 ? 0 : 2,
  });
}
