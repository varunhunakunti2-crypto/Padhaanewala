"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { AdminLayout, AdminDataTableHeader } from "@/components/admin/admin-layout"
import { ScholarshipForm } from "@/components/admin/scholarship-form"
import { adminScholarshipsApi } from "@/lib/scholarships-api"
import type { ScholarshipDetail } from "@/types/scholarship"

export default function AdminEditScholarshipPage({ params }: { params: Promise<{ id: string }> }) {
  const [scholarship, setScholarship] = React.useState<ScholarshipDetail | null | "loading">("loading")

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { id } = await params
        const res = await adminScholarshipsApi.get(id)
        if (!cancelled) setScholarship(res.data)
      } catch {
        if (!cancelled) setScholarship(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params])

  if (scholarship === "loading") {
    return (
      <AdminLayout>
        <AdminDataTableHeader title="Edit Scholarship" />
        <div className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
          <div className="h-8 w-56 animate-pulse rounded bg-[var(--color-hairline-soft)]" />
        </div>
      </AdminLayout>
    )
  }

  if (!scholarship) return notFound()

  return (
    <AdminLayout>
      <AdminDataTableHeader
        title={`Edit ${scholarship.name}`}
        description={`/${scholarship.slug ?? ""} · ${scholarship.provider_name}`}
      />
      <ScholarshipForm scholarship={scholarship} />
    </AdminLayout>
  )
}