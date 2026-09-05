"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarClock, Building2, Landmark, Coins } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { scholarshipsPublicApi } from "@/lib/scholarships-api"
import type { Scholarship, ScholarshipFacets } from "@/types/scholarship"

const PAGE_SIZE = 12

function serverParams(sp: URLSearchParams | null) {
  const course = sp?.get("course") || undefined
  const state = sp?.get("state") || undefined
  const govt = sp?.get("govt") === "government" ? true : sp?.get("govt") === "private" ? false : undefined
  const upcoming = sp?.get("upcoming") === "1"
  const q = sp?.get("q") || undefined
  return { course, state, govt, upcoming, q }
}

export function ScholarshipSearchResults() {
  const searchInstance = useSearchParams()
  const sp = React.useMemo(() => searchInstance ?? new URLSearchParams(), [searchInstance])
  const router = useRouter()
  const { course, state, govt, upcoming, q } = serverParams(sp)

  const [data, setData] = React.useState<Scholarship[] | null>(null)
  const [facets, setFacets] = React.useState<ScholarshipFacets | null>(null)
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(false)
    async function load() {
      try {
        const [res, facRes] = await Promise.all([
          scholarshipsPublicApi.list({
            page: 1,
            size: PAGE_SIZE,
            course,
            state,
            govt,
            upcoming,
            search: q,
          }),
          scholarshipsPublicApi.facets(),
        ])
        if (cancelled) return
        setData(res.data.items)
        setTotal(res.data.total)
        setFacets(facRes.data)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [course, state, govt, upcoming, q])

  const update = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "") next.delete(k)
      else next.set(k, String(v))
    }
    router.push(`/scholarships${next.toString() ? `?${next.toString()}` : ""}`)
  }

  const activeFilters = [course, state, govt !== undefined ? (govt ? "Government" : "Private") : undefined, upcoming ? "Upcoming" : undefined, q].filter(Boolean) as string[]

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      {/* Filters - desktop only */}
      <aside className="hidden lg:block">
        <div className="space-y-5 rounded-md border border-hairline bg-canvas-elevated p-5">
          <FilterGroup label="Course">
            <Select value={course ?? ""} onChange={(e) => update({ course: e.target.value || undefined })}>
              <option value="">All courses</option>
              {(facets?.courses ?? []).map((c) => (
                <option key={c.label} value={c.label}>{c.label} ({c.count})</option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup label="State">
            <Select value={state ?? ""} onChange={(e) => update({ state: e.target.value || undefined })}>
              <option value="">All states</option>
              {(facets?.states ?? []).map((s) => (
                <option key={s.label} value={s.label}>{s.label} ({s.count})</option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup label="Type">
            <Select value={govt === true ? "government" : govt === false ? "private" : ""} onChange={(e) => update({ govt: e.target.value ? e.target.value : undefined })}>
              <option value="">Government & private</option>
              <option value="government">Government schemes</option>
              <option value="private">Private / institutions</option>
            </Select>
          </FilterGroup>
          <label className="flex items-center gap-2 text-[14px] text-body">
            <input
              type="checkbox"
              checked={upcoming ?? false}
              onChange={(e) => update({ upcoming: e.target.checked ? 1 : undefined })}
              className="h-4 w-4 rounded-sm border border-input accent-[var(--color-link)]"
            />
            Upcoming deadlines
          </label>
          {activeFilters.length > 0 ? (
            <Button variant="ghost-sm" className="w-full text-[13px]" onClick={() => router.push("/scholarships")}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </aside>

      {/* Sort + results */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[13px] text-mute">{loading ? "Loading…" : `${total} scholarship${total === 1 ? "" : "s"} found`}</p>
          <p className="text-[13px] text-mute">Sorted by nearest deadline</p>
        </div>

        {error ? (
          <p className="rounded-md border border-error/30 bg-red-50 px-4 py-3 text-[14px] text-error-deep" role="alert">
            We couldn&apos;t load scholarships right now. Please try again.
          </p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.map((s) => (
              <ScholarshipCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-hairline bg-canvas-elevated p-10 text-center">
            <h3 className="font-geist-sans text-[18px] font-semibold text-ink">No scholarships match your filters</h3>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-body">
              Try clearing some filters or widening your search to see more results.
            </p>
            <Button variant="primary-sm" className="mt-4" onClick={() => router.push("/scholarships")}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Mobile filter sheet */}
      <details className="lg:hidden">
        <summary className="cursor-pointer list-none rounded-md border border-hairline bg-canvas-elevated px-4 py-3 text-[14px] font-medium text-ink">
          Filters {activeFilters.length ? `(${activeFilters.length} active)` : ""}
        </summary>
        <div className="mt-2 flex flex-col gap-4 rounded-md border border-hairline bg-canvas-elevated p-5">
          <FilterGroup label="Course">
            <Select value={course ?? ""} onChange={(e) => update({ course: e.target.value || undefined })}>
              <option value="">All courses</option>
              {(facets?.courses ?? []).map((c) => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup label="State">
            <Select value={state ?? ""} onChange={(e) => update({ state: e.target.value || undefined })}>
              <option value="">All states</option>
              {(facets?.states ?? []).map((s) => (
                <option key={s.label} value={s.label}>{s.label}</option>
              ))}
            </Select>
          </FilterGroup>
          <FilterGroup label="Type">
            <Select value={govt === true ? "government" : govt === false ? "private" : ""} onChange={(e) => update({ govt: e.target.value ? e.target.value : undefined })}>
              <option value="">Both</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
            </Select>
          </FilterGroup>
        </div>
      </details>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-mute">{label}</p>
      {children}
    </div>
  )
}

const STATUS_LABEL: Record<string, string> = {
  active: "Applications open",
  expired: "Deadline passed",
  draft: "Draft",
}

export function ScholarshipCard({ s }: { s: Scholarship }) {
  const href = s.slug ? `/scholarships/${s.slug}` : "#"
  const statusKey = s.status || "active"
  const govt = s.is_government
  return (
    <article className="flex h-full flex-col rounded-md border border-hairline bg-canvas-elevated p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Badge variant={govt ? "secondary" : "outline"}>
          {govt ? <Landmark className="mr-1 h-3.5 w-3.5" aria-hidden /> : <Building2 className="mr-1 h-3.5 w-3.5" aria-hidden />}
          {govt ? "Government" : "Private"}
        </Badge>
        <Badge variant={statusKey === "active" ? "success" : statusKey === "expired" ? "error" : "warning"}>
          {STATUS_LABEL[statusKey] ?? statusKey}
        </Badge>
      </div>
      <Link href={href} className="mt-3 font-geist-sans text-[16px] font-semibold leading-snug text-ink hover:text-link">
        {s.name}
      </Link>
      <p className="mt-1 text-[13px] text-body">{s.provider_name}</p>
      <div className="mt-3 flex flex-col gap-1 text-[13px] text-body">
        {s.amount != null ? (
          <span className="inline-flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-mute" aria-hidden /> up to ₹{s.amount.toLocaleString("en-IN")}
          </span>
        ) : null}
        {s.deadline ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-mute" aria-hidden /> Deadline: {new Date(s.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        ) : null}
      </div>
      {s.course_names.length > 0 ? (
        <p className="mt-2 line-clamp-1 text-[12px] text-mute">{s.course_names.join(", ")}</p>
      ) : null}
      <Button variant="primary-sm" size="md" className="mt-4 mt-auto w-full" asChild>
        <Link href={href}>View details</Link>
      </Button>
    </article>
  )
}