import type { FeaturedCollegeItem } from "@/types/homepage";
import Link from "next/link";

export function FeaturedColleges({ colleges }: { colleges: FeaturedCollegeItem[] }) {
  if (!colleges.length) return null;
  return (
    <section className="w-full bg-canvas py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-ink">Featured Colleges</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((c) => (
            <Link key={c.id} href={`/college/${c.college_code}`} className="rounded-xl border border-hairline bg-canvas-elevated p-5 transition-shadow hover:shadow-md">
              <h3 className="font-semibold text-ink">{c.name}</h3>
              <p className="mt-1 text-sm text-mute">{[c.city, c.state].filter(Boolean).join(", ")}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
