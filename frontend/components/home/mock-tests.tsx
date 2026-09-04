import Link from "next/link";
import { ClipboardPen, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { MockTestItem } from "@/types/homepage";

export function MockTests({
  tests,
  title = "Mock Tests",
  eyebrow = "Practice with confidence",
}: {
  tests: MockTestItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} description="Prepare for entrance exams with timed practice tests." />
          <Link href="/mock-tests" className="hidden shrink-0 text-[14px] font-medium text-link hover:text-link-deep sm:inline-flex">
            All mock tests <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
        {!tests.length ? (
          <EmptyState message="Mock tests will appear here once published." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tests.map((t) => (
              <Link key={t.id} href={`/mock-tests/${t.id}`} className="group">
                <Card className="h-full p-6 transition-colors hover:bg-hairline-soft">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas">
                    <ClipboardPen className="h-5 w-5 text-ink" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-geist-sans text-[20px] font-semibold leading-7 tracking-[-0.4px] text-ink">
                    {t.title}
                  </h3>
                  {t.description ? <p className="mt-1 text-[12px] text-mute">{t.description}</p> : null}
                  <CardContent className="flex items-center justify-between p-0 pt-4">
                    <p className="flex items-center gap-1.5 text-[12px] text-body">
                      <Clock className="h-4 w-4 text-mute" aria-hidden />
                      {t.duration_minutes ? `${t.duration_minutes} min` : "Timed"}
                    </p>
                    <ArrowRight className="h-4 w-4 text-mute transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6 sm:hidden">
          <Link href="/mock-tests" className="inline-flex items-center text-[14px] font-medium text-link">
            All mock tests <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}