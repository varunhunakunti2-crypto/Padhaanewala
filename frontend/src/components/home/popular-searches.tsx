import type { PopularSearchItem } from "@/types/homepage";
import Link from "next/link";

export function PopularSearches({ searches }: { searches: PopularSearchItem[] }) {
  if (!searches.length) return null;
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-ink">Popular Searches</h2>
        <div className="flex flex-wrap gap-3">
          {searches.map((s) => (
            <Link key={s.label} href={s.href ?? `/colleges?q=${encodeURIComponent(s.query)}`} className="rounded-full border border-hairline bg-canvas-elevated px-4 py-2 text-sm font-medium text-body transition-colors hover:border-link hover:text-link">
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
