"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, MapPin, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { collegesPublicApi } from "@/lib/colleges-api"
import type { College, CollegeListParams } from "@/types/college"

const TYPES = ["dental", "medical", "engineering", "ayush", "nursing", "pharmacy", "paramedical"]

export function CollegeSearchResults() {
  const sp = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()
  const [data, setData] = React.useState<College[]>([])
  const [total, setTotal] = React.useState(0)
  const page = React.useMemo(() => {
    const p = Number(sp.get("page") ?? "1")
    return Number.isFinite(p) && p > 0 ? p : 1
  }, [sp])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [q, setQ] = React.useState(sp.get("q") ?? "")

  const filters = React.useMemo<CollegeListParams>(() => {
    const p = {
      search: sp.get("q") || undefined,
      state: sp.get("state") || undefined,
      city: sp.get("city") || undefined,
      college_type: (sp.get("type") as CollegeListParams["college_type"]) || undefined,
      is_private:
        sp.get("sector") === "private"
          ? true
          : sp.get("sector") === "government"
            ? false
            : undefined,
      has_hostel: sp.get("hostel") === "yes" ? true : undefined,
      admission_status: sp.get("status") || undefined,
    }
    return p
  }, [sp])

  const fetchColleges = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await collegesPublicApi.list({
        ...filters,
        page,
        size: 6,
      })
      setData(res.data.items ?? [])
      setTotal(res.data.total)
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

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    next.set("page", "1")
    router.push(`/colleges?${next.toString()}`)
  }

  const pages = Math.max(1, Math.ceil(total / 6))

  return (
    <div>
      {/* Search + filters */}
      <div className="mb-8 rounded-md border border-hairline bg-canvas-elevated p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            update({ q: q.trim() || undefined })
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search colleges, courses, exams or locations"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="primary">Search</Button>
        </form>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={sp.get("state") ?? ""} onChange={(e) => update({ state: e.target.value || undefined })}>
            <option value="">All states</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Bihar">Bihar</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Kerala">Kerala</option>
            <option value="Delhi">Delhi</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Rajasthan">Rajasthan</option>
          </Select>
          <Input
            placeholder="City"
            defaultValue={sp.get("city") ?? ""}
            onBlur={(e) => update({ city: e.target.value || undefined })}
          />
          <Select value={sp.get("type") ?? ""} onChange={(e) => update({ type: e.target.value || undefined })}>
            <option value="">All college types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </Select>
          <Select value={sp.get("sector") ?? ""} onChange={(e) => update({ sector: e.target.value || undefined })}>
            <option value="">Govt / Private</option>
            <option value="private">Private</option>
            <option value="government">Government</option>
          </Select>
          <Select value={sp.get("hostel") ?? ""} onChange={(e) => update({ hostel: e.target.value || undefined })}>
            <option value="">Hostel</option>
            <option value="yes">Has hostel</option>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-md border border-hairline bg-canvas-elevated" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-hairline bg-canvas-elevated px-6 py-16 text-center">
          <p className="text-[15px] font-medium text-ink">Something went wrong</p>
          <p className="mt-1 text-sm text-body">Please try again.</p>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-md border border-hairline bg-canvas-elevated px-6 py-16 text-center">
          <p className="text-[15px] font-medium text-ink">No colleges found</p>
          <p className="mt-1 text-sm text-body">Try clearing filters or adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <a key={c.id} href={`/college/${c.slug}`} className="group">
                <div className="flex h-full flex-col rounded-md border border-hairline bg-canvas-elevated p-6 transition-colors hover:bg-hairline-soft">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas">
                      <Building2 className="h-5 w-5 text-ink" aria-hidden />
                    </div>
                    <span className="font-geist-mono text-[12px] text-mute">{c.college_code}</span>
                  </div>
                  <h2 className="mt-4 font-geist-sans text-[18px] font-semibold leading-6 tracking-[-0.2px] text-ink group-hover:text-link">
                    {c.name}
                  </h2>
                  <p className="mt-1 text-[13px] text-body">
                    {c.college_type ? `${c.college_type.charAt(0).toUpperCase() + c.college_type.slice(1)} · ` : ""}
                    {c.is_private ? "Private" : "Government"}
                    {c.rating ? ` · ${c.rating.toFixed(1)}★` : ""}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-[13px] text-body">
                    <MapPin className="h-4 w-4 text-mute" aria-hidden />
                    {[sp.get("city"), sp.get("state")].filter(Boolean).join(", ") || (c.admission_status ?? "Details available")}
                  </p>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => update({ page: String(p) })} />
          </div>
        </>
      )}
    </div>
  )
}