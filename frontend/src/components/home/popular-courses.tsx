import type { PopularCourseItem } from "@/types/homepage";
import Link from "next/link";

export function PopularCourses({ courses }: { courses: PopularCourseItem[] }) {
  if (!courses.length) return null;
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-ink">Popular Courses</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <Link key={c.id} href={`/courses`} className="rounded-xl border border-hairline bg-canvas-elevated p-5 transition-shadow hover:shadow-md">
              <h3 className="font-semibold text-ink">{c.name}</h3>
              {c.level && <p className="mt-1 text-xs text-mute">{c.level}</p>}
              <p className="mt-2 text-sm text-body">{c.colleges_count} colleges</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
