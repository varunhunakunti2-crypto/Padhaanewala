import type { Metadata } from "next"
import { CompareView } from "@/components/college/compare-view"

export const metadata: Metadata = {
  title: "Compare Colleges — Side-by-side Fees, Rating & Admission | Padhaanewala",
  description:
    "Compare up to 4 colleges side by side — courses, fees, accreditation, rating, hostel and admission status from the verified Padhaanewala college database.",
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
          Up to 4 colleges side by side — add colleges from any{" "}
          <a href="/colleges" className="text-link hover:text-link-deep">
            college profile
          </a>{" "}
          using the Compare button.
        </p>
      </div>
      <CompareView />
    </div>
  )
}