import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { PopularCourseItem } from "@/types/homepage";

export function PopularCourses({
  courses,
  title = "Popular Courses",
  eyebrow = "Explore degrees",
}: {
  courses: PopularCourseItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} description="Search colleges offering the degrees that matter to you." />
        {!courses.length ? (
          <EmptyState message="Courses will appear here once published." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="group">
                <Card className="h-full p-6 transition-colors hover:bg-hairline-soft">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas">
                    <GraduationCap className="h-5 w-5 text-ink" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-geist-sans text-[20px] font-semibold leading-7 tracking-[-0.4px] text-ink">
                    {c.name}
                  </h3>
                  <CardContent className="flex items-center justify-between p-0 pt-2">
                    <p className="text-[12px] text-mute">
                      {c.level ? `${c.level} · ` : ""}
                      {c.colleges_count} college{c.colleges_count === 1 ? "" : "s"}
                    </p>
                    <ArrowRight className="h-4 w-4 text-mute transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}