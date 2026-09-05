import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ScholarshipSearchResults } from "@/components/scholarship/scholarship-search-results"

const FILTER_KEYS = ["q", "course", "state", "govt", "upcoming"]

function first(params: { [k: string]: string | string[] | undefined }, key: string): string | undefined {
  const v = params[key]
  return typeof v === "string" ? v : undefined
}

function humanize(value: string): string {
  if (!value) return ""
  return /^[A-Z0-9\s]+$/.test(value) ? value : value.charAt(0).toUpperCase() + value.slice(1)
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }): Promise<Metadata> {
  const params = await searchParams
  const course = first(params, "course")
  const state = first(params, "state")
  const govt = first(params, "govt")

  const parts = [
    course && humanize(course),
    state && `in ${humanize(state)}`,
    govt === "government" && "government",
    govt === "private" && "private",
  ].filter(Boolean)
  const label = parts.join(" ")

  const canonicalQs = new URLSearchParams()
  for (const key of FILTER_KEYS) {
    const v = first(params, key)
    if (v) canonicalQs.set(key, v)
  }
  const canonicalQsS = canonicalQs.toString()

  return {
    title: label
      ? `${label.charAt(0).toUpperCase() + label.slice(1)} Scholarships — Amount, Deadline & Eligibility | Padhaanewala`
      : "Scholarships — Government & Private Schemes with Deadlines | Padhaanewala",
    description: label
      ? `Find ${label} scholarships with amount, eligibility, income criteria and application deadlines from the verified Padhaanewala scholarship database.`
      : "Browse government and private scholarships across India — filter by course, state, type and upcoming deadlines. Verified amounts, eligibility and official application links.",
    alternates: { canonical: canonicalQsS ? `/scholarships?${canonicalQsS}` : "/scholarships" },
  }
}

export default function ScholarshipsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
          Scholarship finder
        </p>
        <h1 className="mt-2 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink">
          Find scholarships for your education
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-6 text-body">
          Government and private scholarships with verified amounts, eligibility,
          income criteria and deadlines. When applying, always use the official
          application link — Padhaanewala helps you find and understand schemes, but
          does not process applications.
        </p>
      </div>
      <Suspense fallback={<ScholarshipGridSkeleton />}>
        <ScholarshipSearchResults />
      </Suspense>
    </div>
  )
}

function ScholarshipGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-44" />
      ))}
    </div>
  )
}