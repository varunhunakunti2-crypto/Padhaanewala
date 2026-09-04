import Link from "next/link";
import { Search } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { PopularSearchItem } from "@/types/homepage";

export function PopularSearches({
  searches,
  title = "Popular College Searches",
  eyebrow = "Students are searching",
}: {
  searches: PopularSearchItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} />
        {!searches.length ? (
          <EmptyState message="Popular searches will appear here once configured." />
        ) : (
          <div className="flex flex-wrap gap-3">
            {searches.map((s) => (
              <Link
                key={s.query}
                href={s.href ?? `/colleges?q=${encodeURIComponent(s.query)}`}
                className="inline-flex items-center gap-2 rounded-pill-category border border-hairline bg-canvas-elevated px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-hairline-soft"
              >
                <Search className="h-4 w-4 text-mute" aria-hidden />
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}