import type { HeroContent } from "@/types/homepage";
import Link from "next/link";

export function HeroSection({ hero }: { hero: HeroContent }) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] py-20 sm:py-28">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        <h1 className="font-geist-sans text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {hero.heading}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          {hero.subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex w-full max-w-lg items-center rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <input
              type="text"
              placeholder={hero.search_placeholder}
              className="flex-1 bg-transparent text-white placeholder:text-slate-400 focus:outline-none"
            />
            <Link
              href="/colleges"
              className="ml-2 shrink-0 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200"
            >
              {hero.search_button_label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
