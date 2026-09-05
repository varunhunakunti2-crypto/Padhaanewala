"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Check, Link2, Sparkles, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/forms/form-field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { aiApi, comparisonApi } from "@/lib/api"
import { collegesPublicApi } from "@/lib/colleges-api"
import {
  addCompareEntry,
  clearCompare,
  COMPARE_LIMIT,
  getCompareList,
  removeCompare,
  useCompareList,
} from "@/lib/shortlist"
import type { CollegeDetail } from "@/types/college"
import type {
  AiCollegeAnalysis,
  AiCompareResponse,
  ComparisonCollege,
  ComparisonPreferences,
  ComparisonResponse,
} from "@/types/comparison"

type ViewCollege = ComparisonCollege

// ---- Row definitions (same list drives the desktop matrix + mobile cards) ----

type RowDef = { key: string; label: string; render: (c: ViewCollege) => React.ReactNode }

function feeLabel(c: ViewCollege): string {
  const fees = c.courses
    .map((co) => co.fees)
    .filter((f): f is number => typeof f === "number" && f > 0)
    .sort((a, b) => a - b)
  return fees.length > 0 ? `From ₹${fees[0].toLocaleString("en-IN")} / year` : "Not available"
}

function coursesLabel(c: ViewCollege): React.ReactNode {
  if (c.courses.length === 0) return "Not available in verified database"
  return (
    <ul className="m-0 list-none p-0">
      {c.courses.slice(0, 5).map((co) => (
        <li key={co.course_id} className="mb-1.5 last:mb-0">
          <span className="font-medium text-ink">{co.name}</span>
          {co.level ? <span className="text-mute"> · {co.level}</span> : null}
          {co.duration_months ? <span className="text-mute"> · {co.duration_months} mo</span> : null}
          {co.fees != null ? (
            <span className="text-mute"> · ₹{co.fees.toLocaleString("en-IN")}/yr</span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function cutoffsLabel(c: ViewCollege): React.ReactNode {
  if (c.cutoffs.length === 0) return "Not available in verified database"
  return (
    <ul className="m-0 list-none p-0">
      {c.cutoffs.slice(0, 3).map((cu, i) => (
        <li key={i} className="mb-1.5 last:mb-0">
          <span className="font-medium text-ink">{cu.course_name}</span>
          <span className="text-mute">
            {" "}
            · {cu.year} · {cu.category ?? "General"} · closing {cu.closing_rank ?? "n/a"}
          </span>
        </li>
      ))}
    </ul>
  )
}

const ROWS: RowDef[] = [
  {
    key: "location",
    label: "Location",
    render: (c) =>
      [c.city, c.district, c.state].filter(Boolean).join(", ") || "Not available",
  },
  {
    key: "type",
    label: "Type",
    render: (c) =>
      [c.college_type ? `${c.college_type} college` : "College", c.is_private ? "Private" : "Government"].join(" · ") ||
      "Not available",
  },
  {
    key: "university",
    label: "University",
    render: (c) => c.university_name || "Not available",
  },
  {
    key: "established",
    label: "Established",
    render: (c) => c.established_year ?? "Not available",
  },
  {
    key: "accreditation",
    label: "Accreditation",
    render: (c) => c.accreditation || "Not available",
  },
  {
    key: "entrance",
    label: "Entrance exam",
    render: (c) => c.entrance_exam || "Not available",
  },
  {
    key: "courses",
    label: "Courses & Duration",
    render: coursesLabel,
  },
  {
    key: "fees",
    label: "Fees",
    render: feeLabel,
  },
  {
    key: "hostel",
    label: "Hostel",
    render: (c) => (c.has_hostel ? "Available" : "Not listed"),
  },
  {
    key: "facilities",
    label: "Facilities",
    render: (c) => (c.facilities.length ? c.facilities.join(", ") : "Not available"),
  },
  {
    key: "admission",
    label: "Admission",
    render: (c) =>
      [c.admission_status ? c.admission_status.charAt(0).toUpperCase() + c.admission_status.slice(1) : null, c.admission_process ? "Process on profile" : null]
        .filter(Boolean)
        .join(" · ") || "Not available",
  },
  {
    key: "eligibility",
    label: "Eligibility",
    render: (c) => c.eligibility || "Not available in verified database",
  },
  {
    key: "cutoffs",
    label: "Cutoffs",
    render: cutoffsLabel,
  },
  {
    key: "rating",
    label: "Rating",
    render: (c) => (c.rating != null ? `${c.rating.toFixed(1)} / 5` : "Not available"),
  },
  {
    key: "reviews",
    label: "Reviews",
    render: (c) =>
      c.reviews.length === 0
        ? "No approved reviews yet"
        : `${c.reviews.length} approved · latest: ${c.reviews[0].rating}/5${c.reviews[0].title ? ` “${c.reviews[0].title}”` : ""}`,
  },
  {
    key: "verified",
    label: "Data source",
    render: (c) =>
      c.verification_status === "verified"
        ? `${c.source_name ?? "Verified"}${c.last_verified_at ? ` · ${new Date(c.last_verified_at).toLocaleDateString("en-IN")}` : ""}`
        : "Not yet verified",
  },
]

function toViewCollege(d: CollegeDetail): ViewCollege {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    official_name: d.official_name,
    college_type: d.college_type,
    is_private: d.is_private,
    accreditation: d.accreditation,
    recognition: d.recognition,
    established_year: d.established_year,
    university_name: d.university_name,
    state: d.location?.state ?? d.state,
    district: d.location?.district ?? d.district,
    city: d.location?.city ?? d.city,
    pincode: d.pincode,
    address: d.address,
    website: d.website,
    email: d.email,
    phone: d.phone,
    entrance_exam: d.entrance_exam,
    admission_status: d.admission_status,
    has_hostel: d.has_hostel,
    rating: d.rating,
    courses: d.courses.map((co) => ({
      course_id: co.course_id,
      name: co.course_name,
      level: co.level,
      duration_months: co.duration_months,
      fees: co.fees,
      intake: co.intake,
    })),
    facilities: d.facilities.map((f) => f.name),
    reviews: d.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      created_at: r.created_at,
    })),
    cutoffs: d.cutoffs,
    eligibility: d.eligibility,
    admission_process: d.admission_process,
    verification_status: d.verification_status,
    source_name: d.source_name,
    last_verified_at: d.last_verified_at,
  }
}

const TIER_STYLE: Record<AiCollegeAnalysis["tier"], { variant: "success" | "warning" | "error"; label: string }> = {
  HIGHLY_SUITABLE: { variant: "success", label: "Highly suitable" },
  POSSIBLE: { variant: "warning", label: "Possible" },
  REACH: { variant: "error", label: "Reach" },
}

export function CompareView() {
  const searchParams = useSearchParams()
  const entries = useCompareList()
  const resolvedOnce = React.useRef(false)

  const [details, setDetails] = React.useState<Record<string, CollegeDetail | undefined>>({})
  const [comparison, setComparison] = React.useState<ComparisonResponse | null>(null)
  const [comparisonError, setComparisonError] = React.useState(false)

  const [ai, setAi] = React.useState<AiCompareResponse | null>(null)
  const [aiLoading, setAiLoading] = React.useState(false)
  const [aiError, setAiError] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // Delta form state for "Ask AI" preferences.
  const [aiPrefCourse, setAiPrefCourse] = React.useState("")
  const [aiPrefBudget, setAiPrefBudget] = React.useState("")
  const [aiPrefHostel, setAiPrefHostel] = React.useState(false)
  const [aiPrefGovt, setAiPrefGovt] = React.useState(false)
  const [aiPrefState, setAiPrefState] = React.useState("")

  // Resolve a shareable ?c=slug1,slug2 URL into compare entries (once).
  React.useEffect(() => {
    if (resolvedOnce.current) return
    const params = searchParams
    if (!params) return
    const raw = params.get("c")
    resolvedOnce.current = true
    if (!raw) return
    const slugs = raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    if (slugs.length === 0) return

    const existing = new Set(getCompareList().map((e) => e.slug))
    const toAdd = slugs.filter((s) => !existing.has(s))
    if (toAdd.length === 0) return

    async function resolve() {
      const results = await Promise.all(
        toAdd.map(async (slug) => {
          try {
            const res = await collegesPublicApi.detail(slug)
            return { slug, college: res.data }
          } catch {
            return null
          }
        })
      )
      for (const r of results) {
        if (r) addCompareEntry({ id: r.college.id, slug: r.college.slug, name: r.college.name })
      }
    }
    void resolve()
  }, [searchParams])

  // Load details (fallback + ids) then the backend comparison response.
  React.useEffect(() => {
    if (entries.length === 0) return
    let cancelled = false
    async function load() {
      const detailResults = await Promise.all(
        entries.map(async (e) => {
          try {
            const res = await collegesPublicApi.detail(e.slug)
            return { slug: e.slug, detail: res.data }
          } catch {
            return { slug: e.slug, detail: undefined }
          }
        })
      )
      if (cancelled) return
      const detailsMap = Object.fromEntries(detailResults.map((r) => [r.slug, r.detail]))
      setDetails(detailsMap)

      const ids = entries.map((e) => e.id ?? detailsMap[e.slug]?.id ?? "").filter(Boolean)
      if (ids.length !== entries.length) return

      try {
        const res = await comparisonApi.compare({ college_ids: ids as string[] })
        if (!cancelled) {
          setComparison(res.data)
          setComparisonError(false)
        }
      } catch {
        if (!cancelled) setComparisonError(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [entries])

  const currentSlugs = new Set(entries.map((e) => e.slug))

  const comparisonColleges =
    comparison?.colleges.filter((c) => currentSlugs.has(c.slug)) ?? null

  const fallbackColleges: ViewCollege[] = ([] as ViewCollege[]).concat(
    ...entries.map((e) => {
      const d = details[e.slug]
      return d ? [toViewCollege(d)] : []
    })
  )

  const viewColleges: ViewCollege[] =
    comparisonColleges && comparisonColleges.length > 0 ? comparisonColleges : fallbackColleges

  const loading = entries.length > 0 && viewColleges.length === 0

  const onRemove = (slug: string) => {
    removeCompare(slug)
  }

  const onClear = () => {
    clearCompare()
    setComparison(null)
    setAi(null)
  }

  const shareUrl = () =>
    `${window.location.origin}/compare?c=${entries.map((e) => e.slug).join(",")}`

  const onCopyLink = async () => {
    if (entries.length === 0) return
    try {
      await navigator.clipboard.writeText(shareUrl())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const requestAi = async () => {
    const ids = entries.map((e) => e.id).filter(Boolean) as string[]
    if (ids.length === 0) return
    setAiLoading(true)
    setAiError(false)
    try {
      const preferences: ComparisonPreferences = {
        course: aiPrefCourse.trim() || undefined,
        budget: aiPrefBudget ? Number(aiPrefBudget) : undefined,
        requires_hostel: aiPrefHostel || undefined,
        prefers_govt: aiPrefGovt || undefined,
        state: aiPrefState.trim() || undefined,
      }
      const res = await aiApi.compare({ college_ids: ids, preferences })
      setAi(res.data)
    } catch {
      setAiError(true)
    } finally {
      setAiLoading(false)
    }
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
          up to {COMPARE_LIMIT} colleges at a time, and share your comparison with a link.
        </p>
        <Button variant="primary" className="mt-6" asChild>
          <Link href="/colleges">Browse colleges</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-mute">
          Comparing <span className="font-medium text-ink">{entries.length}</span> of{" "}
          {COMPARE_LIMIT} ·{" "}
          {entries.length >= COMPARE_LIMIT ? (
            <span className="text-warning-deep">compare limit reached</span>
          ) : (
            <Link href="/colleges" className="text-link hover:text-link-deep">
              add more colleges
            </Link>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost-sm" onClick={onCopyLink} disabled={entries.length === 0}>
            {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Link2 className="h-3.5 w-3.5" aria-hidden />}
            {copied ? "Link copied" : "Copy shareable link"}
          </Button>
          <Button variant="ghost-sm" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Clear all
          </Button>
        </div>
      </div>

      {/* Mobile: stacked college cards */}
      <div className="space-y-4 md:hidden">
        {loading
          ? Array.from({ length: entries.length }).map((_, i) => (
              <div key={i} className="rounded-md border border-hairline bg-canvas-elevated p-5">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-3/4" />
              </div>
            ))
          : viewColleges.map((c) => (
              <MobileCollegeCard key={c.id} college={c} onRemove={onRemove} />
            ))}
        {comparisonError ? (
          <p className="rounded-md border border-warning-soft bg-warning-soft/40 px-3 py-2 text-[13px] text-warning-deep">
            Couldn&apos;t load the combined comparison — showing data from college profiles instead.
          </p>
        ) : null}
      </div>

      {/* Desktop: matrix table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-md border border-hairline">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Side-by-side comparison of selected colleges</caption>
            <thead>
              <tr className="border-b border-hairline bg-canvas-elevated">
                <th
                  scope="col"
                  className="w-44 px-4 py-3 text-left align-top text-[12px] font-medium uppercase tracking-wide text-mute"
                >
                  College
                </th>
                {entries.map((e) => (
                  <th key={e.slug} scope="col" className="min-w-[240px] px-4 py-3 align-top">
                    {loading ? (
                      <Skeleton className="h-5 w-40" />
                    ) : (
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
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <th
                    scope="row"
                    className="bg-hairline-soft px-4 py-3 text-left align-top text-[12px] font-medium uppercase tracking-wide text-mute"
                  >
                    {row.label}
                  </th>
                  {entries.map((e) => {
                    const c = viewColleges.find((cc) => cc.slug === e.slug)
                    return (
                      <td key={e.slug} className="bg-canvas-elevated px-4 py-3 align-top text-[14px] text-body">
                        {loading ? (
                          <Skeleton className="h-4 w-36" />
                        ) : c ? (
                          row.render(c)
                        ) : (
                          <span className="text-error-deep">Unavailable</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <th
                  scope="row"
                  className="bg-hairline-soft px-4 py-3 align-top text-[12px] font-medium uppercase tracking-wide text-mute"
                >
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
        {comparisonError ? (
          <p className="mt-2 rounded-md border border-warning-soft bg-warning-soft/40 px-3 py-2 text-[13px] text-warning-deep">
            Couldn&apos;t load the combined comparison — showing data from college profiles instead.
          </p>
        ) : null}
      </div>

      {comparison?.disclaimer || (comparisonError && details) ? (
        <p className="text-[12px] leading-4 text-mute">
          {comparison?.disclaimer ??
            "Comparison data comes from individual college profiles in the verified database."}
        </p>
      ) : null}

      {/* Ask AI */}
      <section className="rounded-md border border-hairline bg-canvas-elevated p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet" aria-hidden />
          <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">
            Ask AI: which college is better for me?
          </h2>
        </div>
        <p className="mt-2 text-[14px] leading-5 text-body">
          A rules-based estimate using only Padhaanewala&apos;s verified database fields — it is
          guidance, never an admission guarantee.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Course (optional)" htmlFor="ai-course">
            <Input
              id="ai-course"
              placeholder="e.g. BHMS"
              value={aiPrefCourse}
              onChange={(e) => setAiPrefCourse(e.target.value)}
            />
          </FormField>
          <FormField label="Budget ₹/year (optional)" htmlFor="ai-budget">
            <Input
              id="ai-budget"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 200000"
              value={aiPrefBudget}
              onChange={(e) => setAiPrefBudget(e.target.value)}
            />
          </FormField>
          <FormField label="Preferred state (optional)" htmlFor="ai-state">
            <Input
              id="ai-state"
              placeholder="e.g. Karnataka"
              value={aiPrefState}
              onChange={(e) => setAiPrefState(e.target.value)}
            />
          </FormField>
          <label className="flex items-center gap-2 text-[14px] text-body">
            <Checkbox
              checked={aiPrefHostel}
              onChange={(e) => setAiPrefHostel(e.target.checked)}
            />
            Hostel required
          </label>
          <label className="flex items-center gap-2 text-[14px] text-body">
            <Checkbox
              checked={aiPrefGovt}
              onChange={(e) => setAiPrefGovt(e.target.checked)}
            />
            Government only
          </label>
        </div>

        <Button variant="primary" className="mt-5" onClick={requestAi} disabled={aiLoading}>
          {aiLoading ? "Analysing…" : "Ask AI"}
        </Button>

        {aiError ? (
          <p className="mt-4 rounded-md border border-error/30 bg-red-50 px-3 py-2 text-[13px] text-error-deep" role="alert">
            We couldn&apos;t run the analysis right now. Please try again.
          </p>
        ) : null}

        {ai ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-md border border-violet-soft bg-violet-soft/30 p-4">
              <p className="text-[14px] leading-5 text-ink">{ai.overall_summary}</p>
              <p className="mt-2 text-[12px] text-mute">{ai.disclaimer}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {ai.colleges.map((a) => (
                <article key={a.college_id} className="rounded-md border border-hairline p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/college/${a.slug}`}
                      className="font-geist-sans text-[16px] font-semibold text-ink hover:text-link"
                    >
                      {a.name}
                    </Link>
                    <Badge variant={TIER_STYLE[a.tier].variant} className="normal-case">
                      {TIER_STYLE[a.tier].label} · {a.score}/100
                    </Badge>
                  </div>
                  <p className="mt-2 text-[13px] leading-5 text-body">{a.summary}</p>
                  {a.strengths.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-[13px] text-body">
                      {a.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-emerald-600" aria-hidden>+</span> {s}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {a.weaknesses.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-[13px] text-body">
                      {a.weaknesses.map((w, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-warning-deep" aria-hidden>–</span> {w}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {a.sources.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.sources.map((s, i) => (
                        <span
                          key={i}
                          className="rounded-pill-category border border-hairline bg-hairline-soft px-2.5 py-0.5 text-[11px] text-mute"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function MobileCollegeCard({
  college,
  onRemove,
}: {
  college: ViewCollege
  onRemove: (slug: string) => void
}) {
  return (
    <article className="rounded-md border border-hairline bg-canvas-elevated p-5">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/college/${college.slug}`}
          className="font-geist-sans text-[18px] font-semibold text-ink hover:text-link"
        >
          {college.name}
        </Link>
        <button
          type="button"
          aria-label={`Remove ${college.name} from compare`}
          className="mt-0.5 shrink-0 text-mute transition-colors hover:text-error"
          onClick={() => onRemove(college.slug)}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {college.official_name && college.official_name !== college.name ? (
        <p className="mt-1 text-[12px] text-mute">Official name: {college.official_name}</p>
      ) : null}
      <dl className="mt-4 space-y-3">
        {ROWS.map((row) => (
          <div key={row.key} className="grid grid-cols-[110px_1fr] gap-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-mute">
              {row.label}
            </dt>
            <dd className="text-[13px] leading-5 text-body">{row.render(college)}</dd>
          </div>
        ))}
      </dl>
      <Button variant="primary-sm" size="md" className="mt-4 w-full" asChild>
        <Link href={`/college/${college.slug}`}>View full profile</Link>
      </Button>
    </article>
  )
}