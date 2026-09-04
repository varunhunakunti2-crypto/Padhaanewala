import Link from "next/link";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { FeaturedCollegeItem } from "@/types/homepage";

export function FeaturedColleges({
  colleges,
  title = "Featured Colleges",
  eyebrow = "Hand-picked institutions",
}: {
  colleges: FeaturedCollegeItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} description="Trusted colleges selected from our verified database." />
          <Link
            href="/colleges"
            className="hidden shrink-0 text-[14px] font-medium text-link hover:text-link-deep sm:inline-flex"
          >
            View all colleges <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
        {!colleges.length ? (
          <EmptyState message="Featured colleges will appear here once published." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((col) => (
              <Link key={col.id} href={`/college/${col.college_code.toLowerCase()}`} className="group">
                <Card className="h-full p-6 transition-colors hover:bg-hairline-soft">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas">
                      <Building2 className="h-5 w-5 text-ink" aria-hidden />
                    </div>
                    <span className="font-geist-mono text-[12px] text-mute">{col.college_code}</span>
                  </div>
                  <h3 className="mt-4 font-geist-sans text-[20px] font-semibold leading-7 tracking-[-0.4px] text-ink">
                    {col.name}
                  </h3>
                  <CardContent className="p-0 pt-3">
                    {(col.city || col.state) && (
                      <p className="flex items-center gap-1.5 text-[14px] text-body">
                        <MapPin className="h-4 w-4 text-mute" aria-hidden />
                        {[col.city, col.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    <p className="mt-3 text-[14px] font-medium text-link group-hover:text-link-deep">
                      View details
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6 sm:hidden">
          <Link href="/colleges" className="inline-flex items-center text-[14px] font-medium text-link">
            View all colleges <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}