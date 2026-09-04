"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Archive, CheckCircle2, Circle } from "lucide-react"

import { AdminLayout, AdminDataTableHeader } from "@/components/admin/admin-layout"
import { Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"

import { adminCollegesApi } from "@/lib/colleges-api"
import type { College, CollegeListParams } from "@/types/college"

export default function AdminCollegesPage() {
  const toast = useToast()
  const router = useRouter()
  const [data, setData] = React.useState<College[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [size] = React.useState(20)
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<CollegeListParams>({})

  const fetchColleges = React.useCallback(
    async (p: number, f: CollegeListParams) => {
      setLoading(true)
      try {
        const res = await adminCollegesApi.list({ ...f, page: p, size })
        setData(res.data.items ?? [])
        setTotal(res.data.total)
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
    // Load data on mount / filter change. setLoading(true) here is the
    // standard "fetch on mount" pattern (intentional).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchColleges(page, filters)
  }, [page, filters, fetchColleges])

  const applyFilter = (patch: Partial<CollegeListParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const handleArchive = async (college: College) => {
    if (!window.confirm(`Archive "${college.name}"?`)) return
    try {
      await adminCollegesApi.archive(college.id)
      toast.success("College archived")
      router.refresh()
      fetchColleges(page, filters)
    } catch (err) {
      toast.error("Failed to archive", err instanceof Error ? err.message : undefined)
    }
  }

  const handlePublish = async (college: College) => {
    try {
      await adminCollegesApi.publish(college.id, !college.is_published)
      toast.success(college.is_published ? "College unpublished" : "College published")
      fetchColleges(page, filters)
    } catch (err) {
      toast.error("Failed to update publish status", err instanceof Error ? err.message : undefined)
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
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Search name..."
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
          <option value="dental">Dental</option>
          <option value="medical">Medical</option>
          <option value="engineering">Engineering</option>
          <option value="ayush">AYUSH</option>
          <option value="nursing">Nursing</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="paramedical">Paramedical</option>
        </Select>
        <Select
          value={filters.admission_status ?? ""}
          onChange={(e) => applyFilter({ admission_status: e.target.value || undefined })}
        >
          <option value="">All admission status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="tentative">Tentative</option>
        </Select>
      </div>

      <div className="rounded-lg hairline-border">
        <Table<College>
          columns={[
            {
              key: "name",
              header: "College",
              render: (c) => (
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{c.name}</p>
                  <p className="text-xs text-[var(--color-mute)]">{c.college_code} · /{c.slug}</p>
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
                  <Button variant="ghost-sm" size="icon" onClick={() => handlePublish(c)} aria-label={c.is_published ? "Unpublish" : "Publish"}>
                    {c.is_published ? "Unpublish" : "Publish"}
                  </Button>
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
        <Pagination
          currentPage={page}
          totalPages={pages}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  )
}