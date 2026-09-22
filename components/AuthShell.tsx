import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackgroundVideo } from "@/components/site/BackgroundVideo";
import { LogoWordmark } from "@/components/Logo";

// Sign-in and set-password pages: mining film on the left (a short band on
// phones), the form on warm paper on the right.
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-full flex-1 bg-paper lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative flex h-56 flex-col justify-between overflow-hidden bg-coal p-6 text-white sm:h-72 lg:h-auto lg:min-h-screen lg:p-12">
        <BackgroundVideo
          src="/media/hero-pit.mp4"
          poster="/media/hero-pit-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          controlClassName="absolute right-6 bottom-6 z-10 max-lg:hidden lg:right-12 lg:bottom-12"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50" />
        <Link href="/" className="relative z-[1] self-start">
          <LogoWordmark className="text-[19px]" />
        </Link>
        <p className="relative z-[1] max-w-[14ch] text-[clamp(32px,4.5vw,64px)] leading-[0.98] tracking-[-0.045em] max-lg:hidden">
          Mineral trade, done properly<span className="text-rust">.</span>
        </p>
      </aside>

      <main className="flex flex-col justify-center px-4 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <p className="section-label">{eyebrow}</p>
          <h1 className="mt-4 text-[40px] leading-[1.02] tracking-[-0.045em] sm:text-[48px]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-[15px] text-muted">{description}</p>
          )}
          <div className="mt-8">{children}</div>
          <Link
            href="/"
            className="mt-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to the website
          </Link>
        </div>
      </main>
    </div>
  );
}
