import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { BackgroundVideo } from "@/components/site/BackgroundVideo";
import {
  defaultTransactionStages,
  requiredMemberDocuments,
  site,
} from "@/lib/config";

// Public homepage. Everything else on the site sits behind the member login.
export const metadata: Metadata = {
  title: `${site.name} — Mineral trade, done properly`,
  description: site.publicTagline,
};

const nav = [
  { href: "#what-we-do", label: "What we do" },
  { href: "#protocol", label: "How we work" },
  { href: "#difference", label: "The ENM difference" },
  { href: "#footprint", label: "Where we operate" },
];

const countries = [
  "Liberia",
  "South Africa",
  "Zimbabwe",
  "Zambia",
  "DR Congo",
];

const services = [
  {
    title: "Commodity brokerage",
    lead: "Connect verified sellers with qualified buyers.",
    points: [
      "Seller-side and buyer-side representation",
      "Offer, LOI and ICPO coordination",
      "Pricing basis and Incoterms alignment",
    ],
  },
  {
    title: "Seller due diligence",
    lead: "Know who is selling, and what they are entitled to sell.",
    points: [
      "Company registration and profile checks",
      "Proof of authority: mandates and board resolutions",
      "Commodity specifications, quantity and supply capacity",
    ],
  },
  {
    title: "Confidentiality & fee protection",
    lead: "Every party protected before commercial terms are shared.",
    points: [
      "Mutual NDA",
      "Non-circumvention (NCNDA)",
      "Fee protection where intermediaries are involved",
    ],
  },
  {
    title: "Mining insurance & risk",
    lead: "Cover for operations and cargo in demanding environments.",
    points: [
      "Insurance brokerage for mining companies",
      "Operational and transit risk advisory",
      "Active in Zambia and the DR Congo",
    ],
  },
  {
    title: "Supplier liaison",
    lead: "Local relationships where the minerals come from.",
    points: [
      "Supplier introductions in the Copperbelt and DRC",
      "Loading point and country-of-origin verification",
      "On-the-ground coordination",
    ],
  },
  {
    title: "Exploration & market research",
    lead: "Evidence before investment.",
    points: [
      "Mineral exploration support",
      "Market research and buyer mapping",
      "Management of mineral and business activities",
    ],
  },
];

const footprint = [
  {
    country: "Liberia",
    role: "West Africa brokerage",
    heading: "A long-standing presence in West Africa",
    body: "Seller- and buyer-side brokerage led from Nimba County, with deep local relationships and experience working across the United States and West Africa.",
  },
  {
    country: "South Africa",
    role: "Buyer representation",
    heading: "Buyer-side brokerage and government engagement",
    body: "Represents buyers and works with Southern African governments on development matters. Home of the SEZ Africa transaction engagement protocol the consortium works to.",
  },
  {
    country: "Zambia",
    role: "Exploration · Mineral management",
    heading: "Registered to manage mineral activity",
    body: "A Zambian-registered holding company managing mineral and business activities, including market research and mineral exploration, led by a former United Nations diplomat of 27 years.",
  },
  {
    country: "Zimbabwe",
    role: "Brokerage · Fuel trade",
    heading: "Commodities, fuel and technical capability",
    body: "Commodity brokerage for sellers and buyers, alongside fuel trading and computer engineering expertise that keeps transactions organised and documented.",
  },
  {
    country: "DR Congo",
    role: "Supplier liaison · Insurance",
    heading: "Close to the source",
    body: "Liaison with potential suppliers in the Congo and Zambia, with specialist insurance brokerage for mining companies operating in the region.",
  },
];

const checkpoints = defaultTransactionStages.reduce(
  (sum, stage) => sum + stage.items.length,
  0
);

function Stop() {
  return <span className="text-rust">.</span>;
}

export default function Home() {
  return (
    <div className="site flex min-h-full flex-1 flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      {/* Header — floats over the hero film */}
      <header className="absolute inset-x-0 top-0 z-20 text-white">
        <div className="site-wrap flex h-[74px] items-center justify-between gap-6 sm:h-[88px]">
          <Link href="/" className="text-[19px] tracking-[-0.03em]">
            <span className="font-semibold">enm</span>
            <span className="text-white/60">consortium</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[14px] text-white/80 lg:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[14px] transition hover:text-white/70"
            >
              Member portal <ArrowUpRight size={14} />
            </Link>
            <details className="relative lg:hidden">
              <summary className="list-none cursor-pointer" aria-label="Menu">
                <Menu size={20} />
              </summary>
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-paper p-2 text-coal shadow-xl">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-4 py-3 text-[15px] hover:bg-stone"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative flex min-h-[640px] items-end overflow-hidden bg-coal text-white h-[100svh] max-h-[980px]">
          <BackgroundVideo
            src="/media/hero-pit.mp4"
            poster="/media/hero-pit-poster.jpg"
            className="absolute inset-0 h-full w-full object-cover"
            controlClassName="absolute right-4 bottom-6 z-10 sm:right-8 lg:right-14"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/45" />
          <div className="site-wrap relative z-[1] pb-24 sm:pb-28">
            <p className="site-eyebrow mb-6 text-white/75">
              <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-rust" />
              Pan-African mineral trade consortium
            </p>
            <h1 className="site-display max-w-[11ch]">
              Mineral trade, done properly<Stop />
            </h1>
            <div className="mt-8 flex flex-col gap-1 text-[17px] text-white/80 sm:text-[19px]">
              <p>Verified sellers. Qualified buyers.</p>
              <p className="text-white/55">A protocol that protects every party.</p>
            </div>
          </div>
          <p className="site-wrap absolute inset-x-0 bottom-6 z-[1] text-[13px] text-white/60 max-sm:hidden">
            African-founded. Independently governed.
          </p>
        </section>

        {/* Countries strip */}
        <section className="border-b border-rule bg-paper py-8">
          <div className="site-wrap flex flex-col gap-5 md:flex-row md:items-center md:gap-12">
            <p className="site-eyebrow shrink-0 text-slate">Where our members operate</p>
            <ul className="flex flex-wrap gap-x-10 gap-y-3 text-[22px] tracking-[-0.03em] text-coal/80 sm:text-[26px]">
              {countries.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 01 — What we do */}
        <section id="what-we-do" className="site-section scroll-mt-4 bg-paper">
          <div className="site-wrap grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="site-eyebrow mb-6">01 / What we do</p>
              <h2 className="site-title">
                Every stage<Stop />
                <br />
                One accountable team<Stop />
              </h2>
              <p className="mt-8 max-w-[34ch] text-[16px] text-slate">
                From the first introduction to the signed purchase agreement.
                Brokerage, due diligence, protection and risk, working together.
              </p>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-slate">
                {["Identify", "Verify", "Protect", "Transact"].map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    {s} <ArrowUpRight size={13} className="text-slate/50" />
                  </li>
                ))}
              </ul>
              <a href="#protocol" className="site-link mt-10">
                See how a transaction runs <ArrowUpRight size={15} />
              </a>
            </div>

            <div className="border-t border-rule">
              {services.map((s, i) => (
                <details key={s.title} className="site-row border-b border-rule" open={i === 0}>
                  <summary>
                    <span className="site-eyebrow w-6 shrink-0 text-slate">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                    <span className="site-plus" aria-hidden="true">+</span>
                  </summary>
                  <div className="pb-6 pl-10">
                    <p className="text-[15px] text-coal">{s.lead}</p>
                    <ul className="mt-3 space-y-2 text-[14px] text-slate">
                      {s.points.map((p) => (
                        <li key={p}>· {p}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Film band */}
        <section className="relative flex h-[70svh] min-h-[440px] max-h-[720px] items-end overflow-hidden bg-coal text-white">
          <BackgroundVideo
            src="/media/working-pit.mp4"
            poster="/media/working-pit-poster.jpg"
            className="absolute inset-0 h-full w-full object-cover"
            controlClassName="absolute right-4 top-6 z-10 sm:right-8 lg:right-14"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
          <div className="site-wrap relative z-[1] pb-14">
            <p className="site-title max-w-[16ch]">
              From the pit face to the port of loading<Stop />
            </p>
          </div>
        </section>

        {/* 02 — Protocol */}
        <section id="protocol" className="site-section scroll-mt-4 bg-stone">
          <div className="site-wrap">
            <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div>
                <p className="site-eyebrow mb-6">02 / How we work</p>
                <h2 className="site-title">
                  Four phases<Stop />
                  <br />
                  No shortcuts<Stop />
                </h2>
              </div>
              <div className="max-w-[300px]">
                <p className="text-[14px] font-medium tracking-[0.02em] uppercase">
                  Trust is built in order.
                </p>
                <p className="mt-2 text-[14px] text-slate">
                  Every ENM transaction follows the SEZ Africa engagement protocol.
                  No buyer documents are requested until the seller is verified.
                </p>
              </div>
            </div>

            <div className="mt-14 grid overflow-hidden bg-coal text-white lg:grid-cols-2">
              <div className="flex flex-col justify-between gap-10 p-8 sm:p-10">
                <div>
                  <p className="site-eyebrow text-white/55">SEZ Africa / Engagement protocol</p>
                  <p className="mt-6 text-[19px] leading-snug">
                    One protocol<Stop />
                    <br />
                    Every transaction<Stop />
                  </p>
                  <p className="mt-5 max-w-[32ch] text-[14px] text-white/55">
                    Each project in the member portal starts with these phases as
                    its checklist, so progress is visible to every party.
                  </p>
                </div>
                <dl className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                  {[
                    [defaultTransactionStages.length, "Phases"],
                    [checkpoints, "Checkpoints"],
                    [requiredMemberDocuments.length, "Due-diligence documents"],
                  ].map(([n, label]) => (
                    <div key={label}>
                      <dt className="sr-only">{label}</dt>
                      <dd className="text-[44px] leading-none tracking-[-0.05em] sm:text-[56px]">{n}</dd>
                      <dd className="site-eyebrow mt-3 text-white/55">{label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <ol className="border-white/10 bg-coal-2 px-8 sm:px-10 lg:border-l">
                {defaultTransactionStages.map((stage, i) => {
                  const [, name] = stage.name.split(" — ");
                  return (
                    <li key={stage.name} className="border-b border-white/10 py-7 last:border-b-0">
                      <p className="site-eyebrow text-white/45">Phase {String(i + 1).padStart(2, "0")}</p>
                      <p className="mt-2 text-[24px] tracking-[-0.03em] sm:text-[28px]">
                        {name ?? stage.name}
                      </p>
                      <p className="mt-2 max-w-[48ch] text-[14px] text-white/55">{stage.description}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* 03 — Difference */}
        <section id="difference" className="site-section scroll-mt-4 bg-sage">
          <div className="site-wrap">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <p className="site-eyebrow">03 / The ENM difference</p>
              <p className="site-eyebrow text-slate">African-founded. Independently governed.</p>
            </div>
            <h2 className="site-display mt-8 max-w-[18ch] text-[clamp(44px,6.5vw,88px)]">
              Independent members<Stop />
              <br />
              One standard<Stop />
            </h2>

            <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <p className="max-w-[46ch] text-[16px] text-slate">
                ENM brings together independent brokers, advisors and
                operators across Southern, Central and West Africa. Each keeps
                their own business. All of them work to the same protocol, the
                same due diligence and the same protections.
              </p>
              <div className="relative aspect-[16/9] overflow-hidden bg-coal">
                <BackgroundVideo
                  src="/media/processing-plant.mp4"
                  poster="/media/processing-plant-poster.jpg"
                  className="absolute inset-0 h-full w-full object-cover"
                  controlClassName="absolute right-4 bottom-4 z-10"
                />
              </div>
            </div>

            <div className="mt-16 grid gap-10 border-t border-coal/15 pt-10 md:grid-cols-3">
              {[
                {
                  label: "01 / Verification",
                  title: ["Verified", "before discussed"],
                  body: "Parties identify themselves and sellers prove authority to sell before any commercial conversation begins.",
                },
                {
                  label: "02 / Protection",
                  title: ["Protected", "by agreement"],
                  body: "NDA, NCNDA and fee protection are signed before offers change hands, so no one is circumvented.",
                },
                {
                  label: "03 / Accountability",
                  title: ["Tracked", "end to end"],
                  body: "Members, documents and every phase of every project live in one secure portal, visible to the people involved.",
                },
              ].map((c) => (
                <div key={c.label}>
                  <p className="site-eyebrow text-slate">{c.label}</p>
                  <h3 className="mt-5 text-[20px] leading-tight tracking-[-0.02em]">
                    {c.title[0]}<Stop />
                    <br />
                    {c.title[1]}<Stop />
                  </h3>
                  <p className="mt-4 max-w-[36ch] text-[14px] text-slate">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 04 — Footprint */}
        <section id="footprint" className="site-section scroll-mt-4 bg-paper">
          <div className="site-wrap">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="site-eyebrow mb-6">04 / Where we operate</p>
                <h2 className="site-title">
                  Rooted in the<br />
                  regions we serve<Stop />
                </h2>
              </div>
              <div className="max-w-[300px]">
                <p className="site-eyebrow text-slate">Brokers. Advisors. Operators.</p>
                <p className="mt-3 text-[14px] text-slate">
                  Members across five countries, from the Copperbelt to the
                  West African coast.
                </p>
              </div>
            </div>

            <div className="mt-14 border-t border-coal">
              {footprint.map((f) => (
                <details key={f.country} className="site-row border-b border-rule">
                  <summary>
                    <span className="min-w-0 flex-1">{f.country}</span>
                    <span className="site-eyebrow hidden w-[38%] text-slate sm:block">{f.role}</span>
                    <span className="site-plus" aria-hidden="true">+</span>
                  </summary>
                  <div className="grid gap-4 pb-8 sm:grid-cols-[1fr_1.4fr] sm:gap-10">
                    <h3 className="text-[20px] leading-tight tracking-[-0.02em]">
                      {f.heading}<Stop />
                    </h3>
                    <p className="max-w-[56ch] text-[15px] text-slate">{f.body}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="site-section bg-coal text-white">
          <div className="site-wrap">
            <p className="site-eyebrow text-white/55">Let&rsquo;s raise the standard.</p>
            <h2 className="site-display mt-8 max-w-[14ch] text-[clamp(44px,7vw,96px)]">
              What are you looking to trade<span className="text-rust">?</span>
            </h2>
            <div className="mt-14 flex flex-col gap-10 border-t border-white/10 pt-10 md:flex-row md:items-end md:justify-between">
              <div>
                {site.contactEmail ? (
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="inline-flex items-center gap-3 text-[clamp(22px,3vw,34px)] tracking-[-0.03em] transition hover:text-rust"
                  >
                    {site.contactEmail} <ArrowUpRight size={24} />
                  </a>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-3 text-[clamp(22px,3vw,34px)] tracking-[-0.03em] transition hover:text-rust"
                  >
                    Members: sign in to the portal <ArrowUpRight size={24} />
                  </Link>
                )}
                <p className="mt-3 text-[14px] text-white/55">
                  Introductions are handled by a consortium member directly.
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-white/55">
                {countries.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-coal text-white/55">
        <div className="site-wrap flex flex-col gap-4 border-t border-white/10 py-8 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[17px] tracking-[-0.03em] text-white">
            <span className="font-semibold">enm</span>
            <span className="text-white/55">consortium</span>
          </span>
          <span className="site-eyebrow">Mineral trade, done properly.</span>
          <a
            href="https://www.pexels.com/search/videos/mining/"
            className="inline-flex items-center gap-1 transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Films via Pexels <ArrowUpRight size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
}
