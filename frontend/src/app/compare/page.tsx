import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CompareView } from "@/components/college/compare-view"

export const metadata: Metadata = {
  title: "Compare Colleges — Side-by-side Fees, Rating & Admission | Padhaanewala",
  description:
    "Compare up to 4 colleges side by side — courses, fees, accreditation, rating, hostel and admission status from the verified Padhaanewala college database. Share your comparison with a link.",
  alternates: { canonical: "/compare" },
}

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
          College comparison
        </p>
        <h1 className="mt-2 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink">
          Compare colleges
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-6 text-body">
          Add colleges from any{" "}
          <a href="/colleges" className="text-link hover:text-link-deep">
            college profile
          </a>{" "}
          and see verified data side by side.
        </p>
      </div>
      <Suspense fallback={<CompareSkeleton />}>
        <CompareView />
      </Suspense>
    </div>
  )
}

function CompareSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-64" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}