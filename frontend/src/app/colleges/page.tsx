import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CollegeSearchResults } from "@/components/college/college-search-results"

export const metadata: Metadata = {
  title: "Colleges — Search Verified Institutions | Padhaanewala",
  description:
    "Browse and filter verified colleges across India by course, state, city, fees, type and admission status.",
  alternates: { canonical: "/colleges" },
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