import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  Briefcase,
  Building2,
  MapPin,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type CourseCollegeSummary = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  college_type: string | null;
  is_private: boolean;
  min_fee: number | null;
  rating: number | null;
};

type CourseDetailRes = {
  id: string;
  slug: string;
  name: string;
  level: string | null;
  degree: string | null;
  duration_months: number | null;
  eligibility: string | null;
  entrance_exam: string | null;
  admission_procedure: string | null;
  career_info: string | null;
  fee_info: string | null;
  meta_title: string | null;
  meta_description: string | null;
  description: string | null;
  colleges: CourseCollegeSummary[];
  colleges_count: number;
};

async function getCourse(slug: string) {
  try {
    const res = await api.get<{ success: boolean; data: CourseDetailRes }>(`/courses/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Course Not Found" };

  return {
    title: course.meta_title || `${course.name} Course — Details, Eligibility, Colleges | Padhaanewala`,
    description: course.meta_description || `Everything you need to know about ${course.name}. Find out eligibility, admission process, career opportunities, and top colleges offering this course.`,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const durationStr = course.duration_months
    ? course.duration_months >= 12
      ? `${course.duration_months / 12} Years`
      : `${course.duration_months} Months`
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-mute">
        <Link href="/" className="hover:text-ink transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/courses" className="hover:text-ink transition-colors">Courses</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-ink font-medium">{course.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10 rounded-2xl border border-hairline bg-canvas-elevated p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {course.level && <Badge variant="secondary">{course.level}</Badge>}
          {course.degree && <Badge variant="outline">{course.degree}</Badge>}
        </div>
        <h1 className="font-geist-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {course.name}
        </h1>
        {course.description && (
          <p className="mt-4 max-w-3xl text-lg text-body">
            {course.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main Content */}
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 font-geist-sans text-2xl font-semibold text-ink">
              Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-hairline p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hairline-soft">
                    <Clock className="h-5 w-5 text-mute" />
                  </div>
                  <h3 className="font-medium text-ink">Duration</h3>
                </div>
                <p className="text-body pl-13">{durationStr || "Not specified"}</p>
              </div>
              <div className="rounded-xl border border-hairline p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hairline-soft">
                    <GraduationCap className="h-5 w-5 text-mute" />
                  </div>
                  <h3 className="font-medium text-ink">Entrance Exam</h3>
                </div>
                <p className="text-body pl-13">{course.entrance_exam || "Not specified"}</p>
              </div>
            </div>
          </section>

          {(course.eligibility || course.admission_procedure) && (
            <section>
              <h2 className="mb-4 font-geist-sans text-2xl font-semibold text-ink">
                Admission Details
              </h2>
              <div className="space-y-6 rounded-xl border border-hairline p-6">
                {course.eligibility && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 font-medium text-ink">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Eligibility Criteria
                    </h3>
                    <p className="text-body whitespace-pre-wrap leading-relaxed">
                      {course.eligibility}
                    </p>
                  </div>
                )}
                {course.admission_procedure && (
                  <div>
                    <h3 className="mb-2 font-medium text-ink">Admission Procedure</h3>
                    <p className="text-body whitespace-pre-wrap leading-relaxed">
                      {course.admission_procedure}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
          
          {course.fee_info && (
            <section>
              <h2 className="mb-4 font-geist-sans text-2xl font-semibold text-ink">
                Fees Information
              </h2>
              <div className="rounded-xl border border-hairline bg-canvas-elevated p-6">
                <p className="text-body whitespace-pre-wrap leading-relaxed">
                  {course.fee_info}
                </p>
              </div>
            </section>
          )}

          {course.career_info && (
            <section>
              <h2 className="mb-4 font-geist-sans text-2xl font-semibold text-ink">
                Career Opportunities
              </h2>
              <div className="rounded-xl border border-hairline bg-canvas-elevated p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-link/10">
                  <Briefcase className="h-6 w-6 text-link" />
                </div>
                <p className="text-body whitespace-pre-wrap leading-relaxed">
                  {course.career_info}
                </p>
              </div>
            </section>
          )}
          
          {/* Related Courses Placeholder */}
          <section className="pt-8">
            <h2 className="mb-4 font-geist-sans text-2xl font-semibold text-ink">
              Related Courses
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
               <div className="rounded-xl border border-hairline p-6 flex items-center justify-center text-mute italic bg-hairline-soft/50">
                  More {course.level || "similar"} courses coming soon...
               </div>
            </div>
          </section>
        </div>

        {/* Sidebar: Colleges Offering */}
        <div>
          <div className="sticky top-24 rounded-xl border border-hairline bg-canvas-elevated p-6">
            <h2 className="font-geist-sans text-lg font-semibold text-ink mb-1">
              Colleges offering this course
            </h2>
            <p className="text-sm text-mute mb-5">
              {course.colleges_count} verified colleges found
            </p>

            <div className="space-y-4">
              {course.colleges.slice(0, 5).map((college) => (
                <Link
                  key={college.id}
                  href={`/college/${college.slug}`}
                  className="group block rounded-lg border border-hairline p-4 transition-colors hover:border-link hover:bg-hairline-soft"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas">
                      <Building2 className="h-5 w-5 text-ink" />
                    </div>
                    <div>
                      <h3 className="font-medium text-ink group-hover:text-link line-clamp-1">
                        {college.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-body">
                        <MapPin className="h-3 w-3 text-mute" />
                        <span className="truncate">
                          {[college.city, college.state].filter(Boolean).join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}

              {course.colleges_count > 5 && (
                <Button variant="secondary" className="w-full mt-2" asChild>
                  <Link href={`/colleges?course=${encodeURIComponent(course.name)}`}>
                    View all {course.colleges_count} colleges
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}

              {course.colleges_count === 0 && (
                <p className="text-sm text-body italic text-center py-4">
                  No verified colleges mapped yet.
                </p>
              )}
            </div>

            <div className="mt-6 border-t border-hairline pt-6">
              <Button className="w-full" size="lg" asChild>
                <Link href="/contact">Get Admission Assistance</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
