"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Globe, ShieldCheck } from "lucide-react"

import { AdminLayout, AdminDataTableHeader } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { adminScholarshipsApi } from "@/lib/scholarships-api"
import type { Scholarship, ScholarshipListParams } from "@/types/scholarship"

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  active: { className: "bg-emerald-100 text-emerald-800", label: "Active" },
  expired: { className: "bg-red-100 text-red-700", label: "Expired" },
  draft: { className: "bg-[var(--color-warning-soft)] text-[var(--color-warning-deep)]", label: "Draft" },
}

export default function AdminScholarshipsPage() {
  const toast = useToast()
  const [data, setData] = React.useState<Scholarship[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [size] = React.useState(20)
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<ScholarshipListParams>({})
  const [deleting, setDeleting] = React.useState<string | null>(null)

  const fetchList = React.useCallback(
    async (p: number, f: ScholarshipListParams) => {
      setLoading(true)
      try {
        const res = await adminScholarshipsApi.list({ ...f, page: p, size })
        setData(res.data.items ?? [])
        setTotal(res.data.total)
      } catch (err) {
        toast.error("Failed to load scholarships", err instanceof Error ? err.message : undefined)
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size],
  )

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchList(page, filters)
  }, [page, filters, fetchList])

  const applyFilter = (patch: Partial<ScholarshipListParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const changeStatus = async (s: Scholarship, status: string) => {
    try {
      await adminScholarshipsApi.setStatus(s.id, status)
      toast.success(`${s.name} marked ${status}`)
      fetchList(page, filters)
    } catch (err) {
      toast.error("Status update failed", err instanceof Error ? err.message : undefined)
    }
  }

  const remove = async (s: Scholarship) => {
    if (!window.confirm(`Delete scholarship "${s.name}"?`)) return
    setDeleting(s.id)
    try {
      await adminScholarshipsApi.remove(s.id)
      toast.success("Scholarship deleted")
      fetchList(page, filters)
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : undefined)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout>
      <AdminDataTableHeader
        title="Scholarships"
        description="Manage government and private scholarship schemes."
        actions={
          <Button size="md" variant="primary-sm" asChild>
            <Link href="/admin/scholarships/new">
              <Plus className="mr-1 h-4 w-4" aria-hidden /> Add scholarship
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name…"
          className="max-w-xs"
          value={filters.search ?? ""}
          onChange={(e) => applyFilter({ search: e.target.value })}
        />
        <Select value={filters.status ?? ""} onChange={(e) => applyFilter({ status: e.target.value || undefined })} className="w-40">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="draft">Draft</option>
        </Select>
        <Select value={filters.govt === true ? "govt" : filters.govt === false ? "private" : ""} onChange={(e) => applyFilter({ govt: e.target.value ? e.target.value === "govt" : undefined })} className="w-40">
          <option value="">Govt & private</option>
          <option value="govt">Government</option>
          <option value="private">Private</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg hairline-border bg-[var(--color-canvas-elevated)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b hairline-border">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-mute)]">Name</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-mute)]">Provider</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-mute)]">Type</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-mute)]">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-mute)]">Deadline</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-mute)]">Status</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-mute)]">Verified</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-mute)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-mute)]">Loading…</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-mute)]">No scholarships found.</td>
              </tr>
            ) : (
              data.map((s) => {
                const status = STATUS_BADGE[s.status] ?? STATUS_BADGE.draft
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                      <Link href={`/admin/scholarships/${s.id}`} className="hover:text-[var(--color-link)]">{s.name}</Link>
                      {s.slug ? <span className="block text-xs text-[var(--color-mute)]">/{s.slug}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-body)]">{s.provider_name}</td>
                    <td className="px-4 py-3 text-[var(--color-body)]">{s.is_government ? "Government" : "Private"}</td>
                    <td className="px-4 py-3 text-[var(--color-body)]">{s.amount != null ? `₹${s.amount.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="px-4 py-3 text-[var(--color-body)]">
                      {s.deadline ? new Date(s.deadline).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={s.status} onChange={(e) => changeStatus(s, e.target.value)} className="h-8 w-32 text-xs">
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="draft">Draft</option>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      {s.verification_status === "verified" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--color-link)]">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Verified
                        </span>
                      ) : (
                        <span className={`rounded px-2 py-0.5 text-xs ${status.className} opacity-60`}>{s.verification_status ?? "unverified"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost-sm" size="md" className="px-2" asChild title="Edit">
                          <Link href={`/admin/scholarships/${s.id}`}>
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                          </Link>
                        </Button>
                        {s.official_application_url ? (
                          <Button variant="ghost-sm" size="md" className="px-2" asChild title="Official application">
                            <a href={s.official_application_url} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-3.5 w-3.5" aria-hidden />
                            </a>
                          </Button>
                        ) : null}
                        <Button variant="ghost-sm" size="md" className="px-2 text-[var(--color-error)]" title="Delete" disabled={deleting === s.id} onClick={() => remove(s)}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        className="mt-4"
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(total / size))}
        onPageChange={setPage}
      />
    </AdminLayout>
  )
}