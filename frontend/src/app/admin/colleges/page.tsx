"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Pencil,
  Archive,
  CheckCircle2,
  Circle,
  CheckSquare,
  Square,
  Send,
  Eye,
  EyeOff,
} from "lucide-react"

import { AdminLayout, AdminDataTableHeader } from "@/components/admin/admin-layout"
import { Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"

import { adminCollegesApi } from "@/lib/colleges-api"
import type { College, CollegeListParams } from "@/types/college"

const COLLEGE_TYPES = ["dental", "medical", "engineering", "ayush", "nursing", "pharmacy", "paramedical"]

export default function AdminCollegesPage() {
  const toast = useToast()
  const router = useRouter()
  const [data, setData] = React.useState<College[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [size] = React.useState(20)
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<CollegeListParams>({})
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [busy, setBusy] = React.useState(false)

  const fetchColleges = React.useCallback(
    async (p: number, f: CollegeListParams) => {
      setLoading(true)
      try {
        const res = await adminCollegesApi.list({ ...f, page: p, size })
        setData(res.data.items ?? [])
        setTotal(res.data.total)
        setSelected(new Set())
      } catch (err) {
        toast.error("Failed to load colleges", err instanceof Error ? err.message : undefined)
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size],
  )

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchColleges(page, filters)
  }, [page, filters, fetchColleges])

  const applyFilter = (patch: Partial<CollegeListParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const refresh = () => fetchColleges(page, filters)

  const visibleIds = data.map((c) => c.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const inPageSelected = visibleIds.filter((id) => selected.has(id)).length

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of visibleIds) {
        if (allSelected) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleArchive = async (college: College) => {
    if (!window.confirm(`Archive "${college.name}"?`)) return
    try {
      await adminCollegesApi.archive(college.id)
      toast.success("College archived")
      router.refresh()
      refresh()
    } catch (err) {
      toast.error("Failed to archive", err instanceof Error ? err.message : undefined)
    }
  }

  const handlePublish = async (college: College) => {
    try {
      await adminCollegesApi.publish(college.id, !college.is_published)
      toast.success(college.is_published ? "College unpublished" : "College published")
      refresh()
    } catch (err) {
      toast.error("Failed to update publish status", err instanceof Error ? err.message : undefined)
    }
  }

  const handleVerify = async (college: College, status: string) => {
    try {
      await adminCollegesApi.verify(college.id, {
        verification_status: status,
        last_verified_at: status === "verified" ? new Date().toISOString() : undefined,
      })
      toast.success(`Verification set to "${status}"`)
      refresh()
    } catch (err) {
      toast.error("Failed to update verification", err instanceof Error ? err.message : undefined)
    }
  }

  const runBulk = async (
    action: "archive" | "publish" | "unpublish" | "verify",
  ) => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    if (action === "archive" && !window.confirm(`Archive ${ids.length} college(s)?`)) return
    setBusy(true)
    try {
      if (action === "archive") {
        await adminCollegesApi.bulkArchive(ids)
        toast.success(`Archived ${ids.length} college(s)`)
      } else if (action === "publish" || action === "unpublish") {
        await adminCollegesApi.bulkPublish(ids, action === "publish")
        toast.success(`${action === "publish" ? "Published" : "Unpublished"} ${ids.length} college(s)`)
      } else {
        await adminCollegesApi.bulkVerify(ids, {
          verification_status: "verified",
          last_verified_at: new Date().toISOString(),
        })
        toast.success(`Marked ${ids.length} college(s) verified`)
      }
      setSelected(new Set())
      router.refresh()
      refresh()
    } catch (err) {
      toast.error("Bulk action failed", err instanceof Error ? err.message : undefined)
    } finally {
      setBusy(false)
    }
  }

  const pages = Math.max(1, Math.ceil(total / size))

  return (
    <AdminLayout>
      <AdminDataTableHeader
        title="Colleges"
        description={`${total} college${total === 1 ? "" : "s"} in the database`}
        actions={
          <Button asChild>
            <Link href="/admin/colleges/new">
              <Plus className="h-4 w-4" aria-hidden /> Add College
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          placeholder="Search name / code..."
          value={filters.search ?? ""}
          onChange={(e) => applyFilter({ search: e.target.value })}
        />
        <Input
          placeholder="State"
          value={filters.state ?? ""}
          onChange={(e) => applyFilter({ state: e.target.value })}
        />
        <Input
          placeholder="City"
          value={filters.city ?? ""}
          onChange={(e) => applyFilter({ city: e.target.value })}
        />
        <Select
          value={filters.college_type ?? ""}
          onChange={(e) => applyFilter({ college_type: e.target.value || undefined })}
        >
          <option value="">All types</option>
          {COLLEGE_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </Select>
        <Select
          value={filters.verification_status ?? ""}
          onChange={(e) => applyFilter({ verification_status: e.target.value || undefined })}
        >
          <option value="">All verification</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="unverified">Unverified</option>
        </Select>
        <Select
          value={filters.is_published === undefined ? "all" : filters.is_published ? "published" : "draft"}
          onChange={(e) => {
            const v = e.target.value
            applyFilter({ is_published: v === "all" ? undefined : v === "published" })
          }}
        >
          <option value="all">Published + drafts</option>
          <option value="published">Published only</option>
          <option value="draft">Drafts only</option>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-hairline bg-canvas-elevated px-4 py-3">
          <span className="text-[13px] font-medium text-ink">
            {selected.size} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary-sm"
              onClick={() => runBulk("publish")}
              disabled={busy}
            >
              <Send className="h-3.5 w-3.5" aria-hidden /> Publish
            </Button>
            <Button
              variant="ghost-sm"
              onClick={() => runBulk("unpublish")}
              disabled={busy}
            >
              <EyeOff className="h-3.5 w-3.5" aria-hidden /> Unpublish
            </Button>
            <Button
              variant="ghost-sm"
              onClick={() => runBulk("verify")}
              disabled={busy}
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Mark verified
            </Button>
            <Button
              variant="ghost-sm"
              onClick={() => runBulk("archive")}
              disabled={busy}
            >
              <Archive className="h-3.5 w-3.5" aria-hidden /> Archive
            </Button>
            <Button
              variant="ghost-sm"
              onClick={() => setSelected(new Set())}
              disabled={busy}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg hairline-border">
        <Table<College>
          columns={[
            {
              key: "select",
              header: (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="inline-flex items-center text-[var(--color-mute)]"
                  aria-label={allSelected ? "Deselect all on page" : "Select all on page"}
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-emerald-600" aria-hidden />
                  ) : (
                    <Square className="h-4 w-4" aria-hidden />
                  )}
                  <span className="sr-only">{allSelected ? "Deselect all" : "Select all"}</span>
                </button>
              ),
              render: (c) => (
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleOne(c.id)}
                  aria-label={`Select ${c.name}`}
                  className="h-4 w-4 rounded-sm border border-hairline accent-[var(--color-ink)]"
                />
              ),
            },
            {
              key: "name",
              header: "College",
              render: (c) => (
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{c.name}</p>
                  <p className="text-xs text-[var(--color-mute)]">
                    {c.college_code} · /{c.slug}
                    {c.city || c.state ? ` · ${[c.city, c.state].filter(Boolean).join(", ")}` : ""}
                  </p>
                </div>
              ),
            },
            {
              key: "college_type",
              header: "Type",
              render: (c) => (
                <span>
                  {c.college_type ?? "—"} · {c.is_private ? "Private" : "Govt."}
                </span>
              ),
            },
            {
              key: "university_name",
              header: "University",
              render: (c) => <span>{c.university_name ?? "—"}</span>,
            },
            {
              key: "admission_status",
              header: "Admission",
              render: (c) => <span>{c.admission_status ?? "—"}</span>,
            },
            {
              key: "verification_status",
              header: "Verification",
              render: (c) => {
                const verified = c.verification_status === "verified"
                return (
                  <span className="inline-flex items-center gap-1">
                    {verified ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                    ) : (
                      <Circle className="h-4 w-4 text-[var(--color-mute)]" aria-hidden />
                    )}
                    {c.verification_status ?? "unverified"}
                    {c.last_verified_at ? (
                      <span className="text-xs text-[var(--color-mute)]">
                        · {new Date(c.last_verified_at).toLocaleDateString()}
                      </span>
                    ) : null}
                  </span>
                )
              },
            },
            {
              key: "is_published",
              header: "Status",
              render: (c) => (
                <span
                  className={
                    c.is_published
                      ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      : "inline-flex items-center rounded-full bg-[var(--color-hairline-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-mute)]"
                  }
                >
                  {c.is_published ? "Published" : "Draft"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (c) => (
                <div className="flex items-center gap-2">
                  {c.is_published ? (
                    <Button variant="ghost-sm" onClick={() => handlePublish(c)} aria-label="Unpublish">
                      <EyeOff className="h-3.5 w-3.5" aria-hidden /> Unpublish
                    </Button>
                  ) : (
                    <Button variant="ghost-sm" onClick={() => handlePublish(c)} aria-label="Publish">
                      <Eye className="h-3.5 w-3.5" aria-hidden /> Publish
                    </Button>
                  )}
                  {c.verification_status !== "verified" && (
                    <Button variant="ghost-sm" onClick={() => handleVerify(c, "verified")} aria-label="Mark verified">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Verify
                    </Button>
                  )}
                  <Button asChild variant="primary-sm">
                    <Link href={`/admin/colleges/${c.id}`}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                    </Link>
                  </Button>
                  <Button variant="ghost-sm" onClick={() => handleArchive(c)}>
                    <Archive className="h-3.5 w-3.5" aria-hidden /> Archive
                  </Button>
                </div>
              ),
            },
          ]}
          data={data}
          keyExtractor={(c) => c.id}
          isLoading={loading}
          emptyMessage="No colleges found. Adjust filters or add a college."
        />
        <div className="flex items-center justify-between border-t border-hairline px-4 py-1">
          <Pagination
            currentPage={page}
            totalPages={pages}
            onPageChange={setPage}
          />
          {inPageSelected > 0 && (
            <span className="hidden text-xs text-[var(--color-mute)] sm:block">
              {inPageSelected} of {data.length} on this page selected
            </span>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}