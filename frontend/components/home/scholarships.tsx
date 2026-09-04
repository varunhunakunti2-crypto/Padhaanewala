import Link from "next/link";
import { BadgeIndianRupee, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { ScholarshipSummary } from "@/types/homepage";

function formatAmount(amount?: number | null) {
  if (amount == null) return "Amount varies";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function Scholarships({
  scholarships,
  title = "Scholarships",
  eyebrow = "Fund your education",
}: {
  scholarships: ScholarshipSummary[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} description="Apply for scholarships by checking the official source first." />
          <Link href="/scholarships" className="hidden shrink-0 text-[14px] font-medium text-link hover:text-link-deep sm:inline-flex">
            All scholarships <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
        {!scholarships.length ? (
          <EmptyState message="Scholarships will appear here once published." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {scholarships.map((s) => (
              <Link key={s.id} href={`/scholarships/${s.id}`} className="group">
                <Card className="h-full p-6 transition-colors hover:bg-hairline-soft">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas">
                    <BadgeIndianRupee className="h-5 w-5 text-ink" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-geist-sans text-[20px] font-semibold leading-7 tracking-[-0.4px] text-ink">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-[12px] text-mute">{s.provider_name}</p>
                  <CardContent className="p-0 pt-4">
                    <p className="font-geist-mono text-[14px] font-medium text-ink">{formatAmount(s.amount)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6 sm:hidden">
          <Link href="/scholarships" className="inline-flex items-center text-[14px] font-medium text-link">
            All scholarships <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}