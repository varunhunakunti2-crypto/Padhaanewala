import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { UpcomingExamItem } from "@/types/homepage";

export function UpcomingExams({
  exams,
  title = "Upcoming Exams",
  eyebrow = "Important dates",
}: {
  exams: UpcomingExamItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} description="Admission dates that matter — always from our database, never hardcoded." />
          <Link href="/exams" className="hidden shrink-0 text-[14px] font-medium text-link hover:text-link-deep sm:inline-flex">
            All exams <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
        {!exams.length ? (
          <EmptyState message="Exam dates will appear here once published." />
        ) : (
          <ul className="divide-y divide-hairline overflow-hidden rounded-md border border-hairline bg-canvas-elevated">
            {exams.map((e) => (
              <li key={e.id} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/exams/${e.id}`} className="font-geist-sans text-[16px] font-semibold text-ink hover:text-link">
                    {e.name}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-body">{e.event_name}</p>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-ink sm:shrink-0">
                  <CalendarDays className="h-4 w-4 text-mute" aria-hidden />
                  <span className="font-geist-mono">{e.event_date ?? "Date tentative"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 sm:hidden">
          <Link href="/exams" className="inline-flex items-center text-[14px] font-medium text-link">
            All exams <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}