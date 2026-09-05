"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Search,
  MapPin,
  Building2,
  LoaderCircle,
  SlidersHorizontal,
  X,
  ArrowLeftRight,
  Heart,
  ChevronDown,
  GraduationCap,
  BadgeCheck,
  CircleCheck,
  IndianRupee,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { collegesPublicApi } from "@/lib/colleges-api"
import { cn } from "@/lib/utils"
import type {
  College,
  CollegeFacets,
  CollegeListParams,
  CollegeSortValue,
} from "@/types/college"

const COLLEGE_TYPES = [
  "dental",
  "medical",
  "engineering",
  "ayush",
  "nursing",
  "pharmacy",
  "paramedical",
]

const SORT_OPTIONS: { value: CollegeSortValue; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "name", label: "Name (A–Z)" },
  { value: "rating", label: "Rating (high→low)" },
  { value: "fees_asc", label: "Fees (low→high)" },
  { value: "fees_desc", label: "Fees (high→low)" },
]

const TYPE_LABELS: Record<string, string> = {
  dental: "Dental",
  medical: "Medical",
  engineering: "Engineering",
  ayush: "Ayush",
  nursing: "Nursing",
  pharmacy: "Pharmacy",
  paramedical: "Paramedical",
}

function fmtInr(n: number): string {
  return "₹" + n.toLocaleString("en-IN")
}

function humanize(v: string): string {
  return /^[A-Z0-9\s]+$/.test(v) ? v : v.charAt(0).toUpperCase() + v.slice(1)
}

function toParams(sp: URLSearchParams): CollegeListParams {
  const sector = sp.get("sector")
  const hostel = sp.get("hostel")
  const rating = sp.get("rating")
  return {
    search: sp.get("q") || undefined,
    sort: (sp.get("sort") as CollegeSortValue | null) || undefined,
    course: sp.get("course") || undefined,
    state: sp.get("state") || undefined,
    district: sp.get("district") || undefined,
    city: sp.get("city") || undefined,
    college_type: sp.get("type") || undefined,
    is_private:
      sector === "private" ? true : sector === "government" ? false : undefined,
    university: sp.get("university") || undefined,
    min_fee: Number(sp.get("min_fee")) > 0 ? Number(sp.get("min_fee")) : undefined,
    max_fee: Number(sp.get("max_fee")) > 0 ? Number(sp.get("max_fee")) : undefined,
    has_hostel: hostel === "yes" ? true : undefined,
    rating: Number(rating) > 0 ? Number(rating) : undefined,
    accreditation: sp.get("accreditation") || undefined,
    admission_status: sp.get("status") || undefined,
  }
}

type CollectionSuggestion = {
  filterKey: string
  label: string
  meta: string
  slug?: string
}

export function CollegeSearchResults() {
  const searchInstance = useSearchParams()
  const sp = React.useMemo(() => searchInstance ?? new URLSearchParams(), [searchInstance])
  const router = useRouter()

  const [data, setData] = React.useState<College[]>([])
  const [total, setTotal] = React.useState(0)
  const [facets, setFacets] = React.useState<CollegeFacets | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  const page = React.useMemo(() => {
    const p = Number(sp.get("page") ?? "1")
    return Number.isFinite(p) && p > 0 ? p : 1
  }, [sp])

  const filters = React.useMemo<CollegeListParams>(() => toParams(sp), [sp])
  const filterKeysActive = () =>
    ["q", "course", "state", "district", "city", "type", "sector", "university", "min_fee", "max_fee", "hostel", "rating", "accreditation", "status", "sort"].filter(
      (k) => sp.get(k)
    ).length

  const update = React.useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp.toString())
      // New filters reset pagination; explicit page changes re-apply below.
      if (!("page" in patch)) next.delete("page")
      for (const [k, v] of Object.entries(patch)) {
        if (v && v.trim() !== "") next.set(k, v.trim())
        else next.delete(k)
      }
      router.push(`/colleges?${next.toString()}`)
    },
    [sp, router]
  )

  const clearAll = React.useCallback(() => {
    router.push("/colleges")
  }, [router])

  const fetchColleges = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [listRes, facetsRes] = await Promise.all([
        collegesPublicApi.list({ ...filters, page, size: 9 }),
        collegesPublicApi.facets(filters),
      ])
      setData(listRes.data.items ?? [])
      setTotal(listRes.data.total)
      setFacets(facetsRes.data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchColleges()
  }, [fetchColleges])

  // ── Autocomplete ──────────────────────────────────────────────────────────
  const [q, setQ] = React.useState(sp.get("q") ?? "")
  const [suggestions, setSuggestions] = React.useState<CollectionSuggestion[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = React.useState(false)
  const suggestionsSeqRef = React.useRef(0)
  const boxRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(sp.get("q") ?? "")
  }, [sp])

  React.useEffect(() => {
    const text = q.trim()
    if (text.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([])
      setSuggestionsOpen(false)
      return
    }
    const seq = ++suggestionsSeqRef.current
    const handle = window.setTimeout(async () => {
      setSuggestionsLoading(true)
      try {
        const res = await collegesPublicApi.suggestions(text, 4)
        if (seq !== suggestionsSeqRef.current) return
        const out: CollectionSuggestion[] = []
        for (const s of res.data.colleges) {
          out.push({ filterKey: "college", label: s.label, slug: s.value, meta: s.sublabel ?? "" })
        }
        for (const s of res.data.courses) {
          out.push({ filterKey: "course", label: s.label, meta: "Course" })
        }
        for (const s of res.data.exams) {
          out.push({ filterKey: "exam", label: s.label, meta: s.sublabel ?? "Exam" })
        }
        for (const s of res.data.locations) {
          out.push({ filterKey: s.type, label: s.label, meta: humanize(s.type) })
        }
        setSuggestions(out.slice(0, 8))
        setSuggestionsOpen(out.length > 0)
      } catch {
        if (seq === suggestionsSeqRef.current) setSuggestions([])
      } finally {
        if (seq === suggestionsSeqRef.current) setSuggestionsLoading(false)
      }
    }, 250)
    return () => window.clearTimeout(handle)
  }, [q])

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const pickSuggestion = (s: CollectionSuggestion) => {
    if (s.filterKey === "college" && s.slug) {
      router.push(`/college/${s.slug}`)
      return
    }
    if (s.filterKey === "exam") {
      update({ q: s.label, page: undefined })
      return
    }
    if (s.filterKey === "course") update({ course: s.label, q: undefined })
    else if (s.filterKey === "state") update({ state: s.label, q: undefined })
    else if (s.filterKey === "district") update({ district: s.label, q: undefined })
    else if (s.filterKey === "city") update({ city: s.label, q: undefined })
    setSuggestionsOpen(false)
  }

  // ── Mobile filter sheet ────────────────────────────────────────────────────
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const pages = Math.max(1, Math.ceil(total / 9))
  const activeFilters = filterKeysActive()

  return (
    <div>
      {/* Search bar with autocomplete */}
      <form
        className="mb-6"
        onSubmit={(e) => {
          e.preventDefault()
          update({ q: q.trim() || undefined })
          setSuggestionsOpen(false)
        }}
      >
        <div ref={boxRef} className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
            placeholder="Search colleges, courses, exams or locations"
            className="h-12 pl-11 pr-10"
            aria-label="Search"
            role="combobox"
            aria-expanded={suggestionsOpen}
            aria-autocomplete="list"
          />
          {suggestionsLoading ? (
            <LoaderCircle
              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-mute"
              aria-hidden
            />
          ) : (
            q && (
              <button
                type="button"
                onClick={() => {
                  setQ("")
                  update({ q: undefined })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-faint hover:text-body"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
          {suggestionsOpen && (
            <ul
              className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-hairline bg-canvas-elevated shadow-lg"
              role="listbox"
            >
              {suggestions.map((s, i) => (
                <li key={`${s.filterKey}-${s.label}-${i}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(s)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-hairline-soft"
                  >
                    {s.filterKey === "college" ? (
                      <Building2 className="h-4 w-4 shrink-0 text-mute" aria-hidden />
                    ) : s.filterKey === "course" ? (
                      <GraduationCap className="h-4 w-4 shrink-0 text-mute" aria-hidden />
                    ) : s.filterKey === "exam" ? (
                      <BadgeCheck className="h-4 w-4 shrink-0 text-mute" aria-hidden />
                    ) : (
                      <MapPin className="h-4 w-4 shrink-0 text-mute" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {s.label}
                      </span>
                      {s.meta && <span className="block truncate text-xs text-mute">{s.meta}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* ── Filter panel ── */}
        <aside>
          {/* Mobile toggle */}
          <div className="lg:hidden">
            <Button
              type="button"
              variant="ghost-sm"
              className="w-full justify-between"
              onClick={() => setSheetOpen((v) => !v)}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-mute" aria-hidden />
                Filters
                {activeFilters > 0 && (
                  <Badge variant="secondary">{activeFilters}</Badge>
                )}
              </span>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", sheetOpen && "rotate-180")}
                aria-hidden
              />
            </Button>
            {sheetOpen && <FilterPanel sp={sp} update={update} clearAll={clearAll} facets={facets} />}
          </div>

          {/* Desktop rail */}
          <div className="hidden lg:block">
            <FilterPanel sp={sp} update={update} clearAll={clearAll} facets={facets} />
          </div>
        </aside>

        {/* ── Results column ── */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-geist-sans text-[18px] font-semibold leading-6 text-ink">
                {total} college{total === 1 ? "" : "s"}
              </h2>
              {activeFilters > 0 && (
                <p className="mt-0.5 text-[13px] text-mute">
                  Filtered{filterDescription(sp)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort"
                className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute"
              >
                Sort
              </label>
              <Select
                id="sort"
                value={sp.get("sort") ?? "relevance"}
                onChange={(e) => update({ sort: e.target.value || undefined })}
                className="w-auto"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-md border border-hairline bg-canvas-elevated"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-md border border-hairline bg-canvas-elevated px-6 py-16 text-center">
              <p className="text-[15px] font-medium text-ink">Something went wrong</p>
              <p className="mt-1 text-sm text-body">
                We couldn&apos;t load colleges right now. Please try again.
              </p>
              <Button
                variant="secondary"
                className="mt-5"
                onClick={() => fetchColleges()}
              >
                Retry
              </Button>
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-md border border-hairline bg-canvas-elevated px-6 py-16 text-center">
              <p className="text-[15px] font-medium text-ink">No colleges found</p>
              <p className="mt-2 text-sm text-body">
                No colleges match your filters. Try:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-body">
                <li>• Removing a filter or two to widen results</li>
                <li>• Searching a different course or city</li>
                <li>• Clearing the fee range or rating</li>
              </ul>
              <Button variant="secondary" className="mt-6" onClick={clearAll}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.map((c) => (
                  <CollegeCardResult key={c.id} college={c} />
                ))}
              </div>
              {pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={pages}
                    onPageChange={(p) => update({ page: String(p) })}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function filterDescription(sp: URLSearchParams): string {
  const parts: string[] = []
  if (sp.get("course")) parts.push(humanize(sp.get("course")!))
  if (sp.get("state")) parts.push(`in ${humanize(sp.get("state")!)}`)
  if (sp.get("city")) parts.push(`in ${humanize(sp.get("city")!)}`)
  if (sp.get("type")) parts.push(TYPE_LABELS[sp.get("type")!] ?? humanize(sp.get("type")!))
  if (sp.get("sector") === "private") parts.push("private")
  if (sp.get("sector") === "government") parts.push("government")
  return parts.length ? ` by ${parts.join(", ")}` : ""
}

type FilterPanelProps = {
  sp: URLSearchParams
  update: (patch: Record<string, string | undefined>) => void
  clearAll: () => void
  facets: CollegeFacets | null
}

function FacetSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  options: { label: string; count?: number }[]
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
        {label}
      </label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.label} value={o.label}>
            {o.label}
            {typeof o.count === "number" ? ` (${o.count})` : ""}
          </option>
        ))}
      </Select>
    </div>
  )
}

function FilterPanel({ sp, update, clearAll, facets }: FilterPanelProps) {
  const [minFee, setMinFee] = React.useState(sp.get("min_fee") ?? "")
  const [maxFee, setMaxFee] = React.useState(sp.get("max_fee") ?? "")

  const selected = (k: string) => sp.get(k) ?? ""
  const feeApply = () => {
    update({ min_fee: minFee || undefined, max_fee: maxFee || undefined })
  }

  return (
    <div className="space-y-4 rounded-md border border-hairline bg-canvas-elevated p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-geist-sans text-[15px] font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-mute" aria-hidden />
          Filters
        </span>
        <button
          type="button"
          onClick={clearAll}
          className="text-[13px] font-medium text-link hover:text-link-deep"
        >
          Clear filters
        </button>
      </div>

      <FacetSelect
        label="Course"
        value={selected("course")}
        placeholder="Any course"
        onChange={(v) => update({ course: v || undefined })}
        options={facets?.courses ?? []}
      />
      <FacetSelect
        label="State"
        value={selected("state")}
        placeholder="All states"
        onChange={(v) => {
          update({ state: v || undefined, district: undefined, city: undefined })
        }}
        options={facets?.states ?? []}
      />
      <FacetSelect
        label="District"
        value={selected("district")}
        placeholder="All districts"
        onChange={(v) => update({ district: v || undefined, city: undefined })}
        options={facets?.districts ?? []}
      />
      <FacetSelect
        label="City"
        value={selected("city")}
        placeholder="All cities"
        onChange={(v) => update({ city: v || undefined })}
        options={facets?.cities ?? []}
      />

      {/* Type + sector */}
      <div className="grid grid-cols-2 gap-3">
        <FacetSelect
          label="Type"
          value={selected("type")}
          placeholder="Any type"
          onChange={(v) => update({ type: v || undefined })}
          options={COLLEGE_TYPES.map((t) => ({ label: TYPE_LABELS[t] ?? t }))}
        />
        <div>
          <label className="mb-1.5 block font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
            Sector
          </label>
          <Select
            value={selected("sector")}
            onChange={(e) => update({ sector: e.target.value || undefined })}
            aria-label="Sector"
          >
            <option value="">Any</option>
            <option value="private">Private</option>
            <option value="government">Government</option>
          </Select>
        </div>
      </div>

      <FacetSelect
        label="University"
        value={selected("university")}
        placeholder="Any university"
        onChange={(v) => update({ university: v || undefined })}
        options={facets?.universities ?? []}
      />

      {/* Fees range */}
      <div>
        <label className="mb-1.5 block font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
          Annual fees
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min ₹"
            value={minFee}
            onChange={(e) => setMinFee(e.target.value)}
            aria-label="Minimum fee"
          />
          <span className="text-mute">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max ₹"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            aria-label="Maximum fee"
            onKeyDown={(e) => e.key === "Enter" && feeApply()}
          />
        </div>
        <Button variant="ghost-sm" size="md" type="button" className="mt-2 w-full" onClick={feeApply}>
          Apply fee range
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
            Min rating
          </label>
          <Select
            value={selected("rating")}
            onChange={(e) => update({ rating: e.target.value || undefined })}
            aria-label="Minimum rating"
          >
            <option value="">Any</option>
            {[4.5, 4, 3.5, 3, 2.5, 2].map((r) => (
              <option key={r} value={String(r)}>
                {r}★ and above
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
            Hostel
          </label>
          <Select
            value={selected("hostel")}
            onChange={(e) => update({ hostel: e.target.value || undefined })}
            aria-label="Hostel"
          >
            <option value="">Any</option>
            <option value="yes">Has hostel</option>
            <option value="no">No hostel</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FacetSelect
          label="Accreditation"
          value={selected("accreditation")}
          placeholder="Any"
          onChange={(v) => update({ accreditation: v || undefined })}
          options={facets?.accreditation ?? []}
        />
        <div>
          <label className="mb-1.5 block font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
            Admission
          </label>
          <Select
            value={selected("status")}
            onChange={(e) => update({ status: e.target.value || undefined })}
            aria-label="Admission status"
          >
            <option value="">Any</option>
            {facets
              ? facets.admission_statuses.map((s) => (
                  <option key={s.label} value={s.label}>
                    {humanize(s.label)}
                  </option>
                ))
              : ["open", "closed", "tentative"].map((s) => (
                  <option key={s} value={s}>
                    {humanize(s)}
                  </option>
                ))}
          </Select>
        </div>
      </div>
    </div>
  )
}

function CollegeCardResult({ college }: { college: College }) {
  const [saved, setSaved] = React.useState(false)
  const [comparing, setComparing] = React.useState(false)
  const courseText = (college.course_names ?? []).slice(0, 3).join(", ")
  const hasMoreCourses = (college.course_names ?? []).length > 3

  return (
    <article className="group flex h-full flex-col rounded-md border border-hairline bg-canvas-elevated p-5 transition-colors hover:bg-hairline-soft">
      <div className="flex items-start justify-between gap-3">
        <a href={`/college/${college.slug}`} className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas">
            <Building2 className="h-5 w-5 text-ink" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="font-geist-sans text-[16px] font-semibold leading-6 tracking-[-0.2px] text-ink group-hover:text-link">
              {college.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-[13px] text-body">
              <MapPin className="h-3.5 w-3.5 text-mute" aria-hidden />
              <span className="truncate">
                {[college.city, college.district, college.state].filter(Boolean).join(", ") || "Location available"}
              </span>
            </p>
          </div>
        </a>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className="rounded-full p-2 text-mute transition-colors hover:bg-hairline-soft hover:text-ink"
            aria-label={saved ? "Remove from saved" : "Save college"}
            aria-pressed={saved}
          >
            <Heart
              className={cn("h-4 w-4", saved && "fill-error text-error")}
              aria-hidden
            />
          </button>
          <button
            type="button"
            onClick={() => setComparing((v) => !v)}
            className="rounded-full p-2 text-mute transition-colors hover:bg-hairline-soft hover:text-ink"
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            aria-pressed={comparing}
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">
          {college.is_private ? "Private" : "Government"}
        </Badge>
        {college.college_type && (
          <Badge variant="outline">
            {TYPE_LABELS[college.college_type] ?? humanize(college.college_type)}
          </Badge>
        )}
        {college.admission_status && (
          <Badge
            variant={
              college.admission_status === "open"
                ? "success"
                : college.admission_status === "tentative"
                  ? "warning"
                  : "error"
            }
          >
            {humanize(college.admission_status)}
          </Badge>
        )}
      </div>

      {college.rating ? (
        <p className="mt-3 flex items-center gap-1 text-[13px] text-body">
          <span className="font-medium text-ink">{(college.rating).toFixed(1)}</span>
          <span className="text-warning" aria-hidden>★</span>
          <span className="text-mute">rating</span>
        </p>
      ) : null}

      {courseText && (
        <p className="mt-2 flex items-start gap-1.5 text-[13px] text-body">
          <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-mute" aria-hidden />
          <span className="line-clamp-2">
            {courseText}
            {hasMoreCourses ? ` +${college.course_names!.length - 3} more` : ""}
          </span>
        </p>
      )}

      {college.min_fee != null && (
        <p className="mt-auto flex items-center gap-1 pt-4 text-[15px] font-medium text-ink">
          <IndianRupee className="h-4 w-4 text-link" aria-hidden />
          {fmtInr(college.min_fee)}
          <span className="text-xs font-normal text-mute">/ year onwards</span>
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-4">
        <Button asChild variant="primary-sm" className="flex-1">
          <a href={`/college/${college.slug}`}>View details</a>
        </Button>
        {comparing && (
          <span className="flex items-center gap-1 text-[12px] font-medium text-link">
            <CircleCheck className="h-4 w-4" aria-hidden />
            In compare
          </span>
        )}
      </div>
    </article>
  )
}