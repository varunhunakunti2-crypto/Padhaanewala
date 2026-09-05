"use client"

import * as React from "react"
import Link from "next/link"
import { Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { collegesPublicApi } from "@/lib/colleges-api"
import { clearCompare, COMPARE_LIMIT, removeCompare, useCompareList } from "@/lib/shortlist"
import type { CollegeDetail } from "@/types/college"

type RowDef = { key: string; label: string; render: (d: CollegeDetail) => React.ReactNode }

const ROWS: RowDef[] = [
  {
    key: "location",
    label: "Location",
    render: (d) => [d.location?.city, d.location?.district, d.location?.state].filter(Boolean).join(", ") || "—",
  },
  {
    key: "type",
    label: "Type",
    render: (d) => (d.college_type ? `${d.college_type} college` : "—"),
  },
  {
    key: "ownership",
    label: "Ownership",
    render: (d) => (d.is_private ? "Private" : "Government"),
  },
  {
    key: "established",
    label: "Established",
    render: (d) => (d.established_year ? String(d.established_year) : "—"),
  },
  {
    key: "university",
    label: "University",
    render: (d) => d.university_name || "—",
  },
  {
    key: "accreditation",
    label: "Accreditation",
    render: (d) => d.accreditation || "—",
  },
  {
    key: "rating",
    label: "Rating",
    render: (d) =>
      d.rating != null ? `${d.rating.toFixed(1)} / 5 (${d.reviews.length} reviews)` : "—",
  },
  {
    key: "admission",
    label: "Admission status",
    render: (d) =>
      d.admission_status
        ? d.admission_status.charAt(0).toUpperCase() + d.admission_status.slice(1)
        : "—",
  },
  {
    key: "courses",
    label: "Courses",
    render: (d) => (d.courses.length > 0 ? d.courses.map((c) => c.course_name).join(", ") : "—"),
  },
  {
    key: "fees",
    label: "Fees",
    render: (d) => {
      const fees = d.courses
        .map((c) => c.fees)
        .filter((f): f is number => typeof f === "number" && f > 0)
        .sort((a, b) => a - b)
      return fees.length > 0 ? `From ₹${fees[0].toLocaleString("en-IN")} / year` : "—"
    },
  },
  {
    key: "hostel",
    label: "Hostel",
    render: (d) => (d.has_hostel ? "Available" : "Not available"),
  },
  {
    key: "verified",
    label: "Data source",
    render: (d) =>
      d.verification_status === "verified"
        ? `${d.source_name ?? "Verified"}${d.last_verified_at ? ` · ${new Date(d.last_verified_at).toLocaleDateString("en-IN")}` : ""}`
        : "Not yet verified",
  },
]

export function CompareView() {
  const entries = useCompareList()
  const [details, setDetails] = React.useState<Record<string, CollegeDetail | undefined>>({})

  React.useEffect(() => {
    if (entries.length === 0) return
    let cancelled = false
    async function load() {
      const results = await Promise.all(
        entries.map(async (e) => {
          try {
            const res = await collegesPublicApi.detail(e.slug)
            return { slug: e.slug, detail: res.data }
          } catch {
            return { slug: e.slug, detail: undefined }
          }
        })
      )
      if (!cancelled) {
        setDetails((prev) => ({ ...prev, ...Object.fromEntries(results.map((r) => [r.slug, r.detail])) }))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [entries])

  const onRemove = (slug: string) => {
    removeCompare(slug)
  }

  const onClear = () => {
    clearCompare()
    setDetails({})
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-hairline bg-canvas-elevated p-10 text-center">
        <h2 className="font-geist-sans text-[20px] font-semibold text-ink">
          No colleges to compare yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-5 text-body">
          Open a college profile and press{" "}
          <span className="font-medium text-ink">Compare</span> to add it here. You can compare
          up to {COMPARE_LIMIT} colleges at a time.
        </p>
        <Button variant="primary" className="mt-6" asChild>
          <Link href="/colleges">Browse colleges</Link>
        </Button>
      </div>
    )
  }

  const hasLoaded = (slug: string) => Object.prototype.hasOwnProperty.call(details, slug)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[13px] text-mute">
          Comparing {entries.length} of {COMPARE_LIMIT}
        </p>
        <Button variant="ghost-sm" onClick={onClear} className="text-[13px]">
          <Trash2 className="h-3.5 w-3.5" aria-hidden /> Clear all
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-hairline">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Side-by-side comparison of selected colleges</caption>
          <thead>
            <tr className="border-b border-hairline bg-canvas-elevated">
              <th scope="col" className="w-40 px-4 py-3 text-left align-top text-[12px] font-medium uppercase tracking-wide text-mute">
                College
              </th>
              {entries.map((e) => (
                <th key={e.slug} scope="col" className="min-w-[220px] px-4 py-3 align-top">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/college/${e.slug}`}
                      className="font-geist-sans text-[16px] font-semibold text-ink hover:text-link"
                    >
                      {e.name}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Remove ${e.name} from compare`}
                      className="mt-0.5 shrink-0 text-mute transition-colors hover:text-error"
                      onClick={() => onRemove(e.slug)}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {ROWS.map((row) => (
              <tr key={row.key}>
                <th scope="row" className="bg-hairline-soft px-4 py-3 text-left align-top text-[12px] font-medium uppercase tracking-wide text-mute">
                  {row.label}
                </th>
                {entries.map((e) => {
                  const d = details[e.slug]
                  return (
                    <td key={e.slug} className="bg-canvas-elevated px-4 py-3 align-top text-[14px] text-body">
                      {!hasLoaded(e.slug) ? (
                        <Skeleton className="h-4 w-36" />
                      ) : d ? (
                        row.render(d)
                      ) : (
                        <span className="text-error-deep">Unavailable</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <th scope="row" className="bg-hairline-soft px-4 py-3 align-top text-[12px] font-medium uppercase tracking-wide text-mute">
                Details
              </th>
              {entries.map((e) => (
                <td key={e.slug} className="bg-canvas-elevated px-4 py-3 align-top">
                  <Button variant="primary-sm" size="md" asChild>
                    <Link href={`/college/${e.slug}`}>View full profile</Link>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[12px] leading-4 text-mute">
        Compare data is the same verified database as each college profile. Fees and cutoffs
        change by year — confirm current details with the institution.
      </p>
    </div>
  )
}