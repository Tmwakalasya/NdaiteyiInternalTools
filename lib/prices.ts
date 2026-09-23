import "server-only";

// Indicative metal prices from Metals.Dev (https://metals.dev).
// Their terms allow publishing rates on a website only while a paid
// subscription is active, so the ticker stays hidden until
// METALS_DEV_API_KEY is set.

export type MetalQuote = {
  key: string;
  label: string;
  unit: "oz" | "t";
  price: number;
  // Percent change against the previous day's close; null when the
  // history endpoint doesn't cover this metal.
  changePercent: number | null;
};

export type MetalPrices = {
  quotes: MetalQuote[];
  // ISO timestamp of the price feed, shown on the ticker.
  updatedAt: string;
};

// Metals relevant to members' markets: PGMs and gold (Zimbabwe, South
// Africa), copper (Zambia, DRC), nickel. Cobalt, iron ore and lithium
// aren't offered by the feed.
const METALS: { key: string; label: string; unit: "oz" | "t" }[] = [
  { key: "copper", label: "Copper", unit: "t" },
  { key: "gold", label: "Gold", unit: "oz" },
  { key: "platinum", label: "Platinum", unit: "oz" },
  { key: "palladium", label: "Palladium", unit: "oz" },
  { key: "nickel", label: "Nickel", unit: "t" },
  { key: "silver", label: "Silver", unit: "oz" },
  { key: "zinc", label: "Zinc", unit: "t" },
  { key: "aluminum", label: "Aluminium", unit: "t" },
];

// Markets close at weekends, so allow a few days before treating the feed
// as stale. Stale prices are hidden rather than shown.
const MAX_AGE_MS = 72 * 60 * 60 * 1000;

const TROY_OUNCES_PER_KG = 32.1507466;
const TROY_OUNCES_PER_TONNE = 32150.7466;
// How often to refresh latest prices. Hourly (~750 requests/month) suits
// the paid Copper plan; set METALS_DEV_REFRESH_HOURS=12 for the free plan's
// 100 requests/month (~90 with the daily history call).
const REFRESH_SECONDS =
  Math.max(1, Number(process.env.METALS_DEV_REFRESH_HOURS) || 1) * 3600;

// Overridable for local testing against a mock server.
const API = process.env.METALS_DEV_API_URL ?? "https://api.metals.dev/v1";

type LatestResponse = {
  status: string;
  metals?: Record<string, number>;
  timestamps?: { metal?: string };
};

type TimeseriesResponse = {
  status: string;
  rates?: Record<string, { metals?: Record<string, number> }>;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getMetalPrices(): Promise<MetalPrices | null> {
  const apiKey = process.env.METALS_DEV_API_KEY;
  if (!apiKey) return null;

  try {
    // Latest prices in USD per kg: more precise for base metals than per
    // troy ounce.
    const latestRes = await fetch(
      `${API}/latest?api_key=${apiKey}&currency=USD&unit=kg`,
      { next: { revalidate: REFRESH_SECONDS } }
    );
    const latest = (await latestRes.json()) as LatestResponse;
    if (latest.status !== "success" || !latest.metals) return null;

    // Previous daily closes (USD per troy ounce), cached for a day.
    const today = new Date();
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 6);
    const end = new Date(today);
    end.setUTCDate(end.getUTCDate() - 1);
    const previous = await getPreviousClose(apiKey, isoDate(start), isoDate(end));

    const quotes: MetalQuote[] = [];
    for (const metal of METALS) {
      const perKg = latest.metals[metal.key];
      if (typeof perKg !== "number" || perKg <= 0) continue;
      const price =
        metal.unit === "oz" ? perKg / TROY_OUNCES_PER_KG : perKg * 1000;

      const prevPerOz = previous?.[metal.key];
      const prev =
        typeof prevPerOz === "number" && prevPerOz > 0
          ? metal.unit === "oz"
            ? prevPerOz
            : prevPerOz * TROY_OUNCES_PER_TONNE
          : null;

      quotes.push({
        ...metal,
        price,
        changePercent: prev ? ((price - prev) / prev) * 100 : null,
      });
    }

    const updatedAt = latest.timestamps?.metal;
    if (quotes.length === 0 || !updatedAt) return null;
    const age = Date.now() - new Date(updatedAt).getTime();
    if (!(age < MAX_AGE_MS)) return null;
    return { quotes, updatedAt };
  } catch {
    // Never let the ticker take the page down.
    return null;
  }
}

async function getPreviousClose(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(
      `${API}/timeseries?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`,
      { next: { revalidate: 86400 } }
    );
    const data = (await res.json()) as TimeseriesResponse;
    if (data.status !== "success" || !data.rates) return null;
    // Most recent day with data (weekends and holidays may be missing).
    const days = Object.keys(data.rates).sort();
    for (let i = days.length - 1; i >= 0; i--) {
      const metals = data.rates[days[i]]?.metals;
      if (metals && Object.keys(metals).length > 0) return metals;
    }
    return null;
  } catch {
    return null;
  }
}
