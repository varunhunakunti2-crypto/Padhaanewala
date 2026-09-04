import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CollegeSearchResults } from "@/components/college/college-search-results"

const FILTER_KEYS = [
  "q",
  "course",
  "state",
  "district",
  "city",
  "type",
  "sector",
  "university",
  "min_fee",
  "max_fee",
  "hostel",
  "rating",
  "accreditation",
  "status",
  "sort",
]

function humanize(value: string): string {
  if (!value) return ""
  return /^[A-Z0-9\s]+$/.test(value)
    ? value
    : value.charAt(0).toUpperCase() + value.slice(1)
}

type SearchParams = { [key: string]: string | string[] | undefined }

function first(params: SearchParams, key: string): string | undefined {
  const v = params[key]
  return typeof v === "string" ? v : undefined
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const params = await searchParams
  const course = first(params, "course")
  const state = first(params, "state")

  const parts = [
    course && humanize(course),
    state && `in ${humanize(state)}`,
  ].filter(Boolean)

  const filterLabel = parts.join(" ")

  // Canonical reflects the active filters (pagination excluded) so each
  // meaningful filter URL has its own canonical; curated paths are Phase 31.
  const canonicalQs = new URLSearchParams()
  for (const key of FILTER_KEYS) {
    const v = first(params, key)
    if (v) canonicalQs.set(key, v)
  }
  const canonicalQsString = canonicalQs.toString()

  return {
    title: filterLabel
      ? `${filterLabel} — Colleges, Fees & Admission | Padhaanewala`
      : "Colleges — Search Verified Institutions | Padhaanewala",
    description: filterLabel
      ? `Find ${filterLabel} colleges with verified fees, ratings, hostel and admission status. Filter by course, city, university and more on Padhaanewala.`
      : "Browse and filter verified colleges across India by course, state, city, fees, type and admission status.",
    alternates: {
      canonical: canonicalQsString ? `/colleges?${canonicalQsString}` : "/colleges",
    },
  }
}

export default function CollegesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
          College search
        </p>
        <h1 className="mt-2 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink">
          Find colleges across India
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-6 text-body">
          Filter by course, state, city, fees, type and more — all data from the
          verified Padhaanewala college database.
        </p>
      </div>

      <Suspense fallback={<CollegeListSkeleton />}>
        <CollegeSearchResults />
      </Suspense>
    </div>
  )
}

function CollegeListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-md" />
      ))}
    </div>
  )
}