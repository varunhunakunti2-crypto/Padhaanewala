import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { GraduationCap, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Courses — Degree & Diploma Programs | Padhaanewala",
  description:
    "Browse through undergraduate and postgraduate courses across India. Find out about eligibility, admission processes, career opportunities, and colleges.",
  alternates: {
    canonical: "/courses",
  },
};

type CourseListRes = {
  id: string;
  name: string;
  slug: string;
  level: string | null;
  degree: string | null;
  duration_months: number | null;
};

export default async function CoursesPage() {
  let courses: CourseListRes[] = [];
  try {
    const res = await api.get<{ success: boolean; data: CourseListRes[] }>("/courses");
    courses = res.data ?? [];
  } catch (err) {
    console.error("[courses] failed to load list:", err);
  }

  // Basic grouping by level
  const grouped = courses.reduce((acc, course) => {
    const lvl = course.level || "Other";
    if (!acc[lvl]) acc[lvl] = [];
    acc[lvl].push(course);
    return acc;
  }, {} as Record<string, CourseListRes[]>);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <h1 className="font-geist-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Explore Courses
        </h1>
        <p className="mt-4 text-lg text-body">
          Browse comprehensive details about degrees, diplomas, and certification
          programs. Find out the eligibility, duration, and top colleges offering
          them.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-canvas-elevated p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-mute" />
          <h3 className="mt-4 text-lg font-medium text-ink">No courses found</h3>
          <p className="mt-2 text-body">Check back soon for updated course listings.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([level, list]) => (
            <div key={level}>
              <h2 className="mb-6 font-geist-sans text-xl font-semibold text-ink">
                {level} Programs
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((course) => (
                  <Link
                    href={`/courses/${course.slug}`}
                    key={course.id}
                    className="group relative flex flex-col justify-between rounded-xl border border-hairline bg-canvas-elevated p-6 transition-all hover:border-link hover:shadow-sm"
                  >
                    <div>
                      <h3 className="font-geist-sans text-lg font-medium text-ink group-hover:text-link">
                        {course.name}
                      </h3>
                      {course.degree && (
                        <p className="mt-1 text-sm font-medium text-mute">
                          {course.degree}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-body">
                      {course.duration_months && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-mute" />
                          <span>
                            {course.duration_months >= 12
                              ? `${course.duration_months / 12} Years`
                              : `${course.duration_months} Months`}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
