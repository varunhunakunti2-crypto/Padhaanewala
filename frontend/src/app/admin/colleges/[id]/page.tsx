"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { AdminLayout, AdminDataTableHeader } from "@/components/admin/admin-layout"
import { CollegeForm } from "@/components/admin/college-form"
import { adminCollegesApi } from "@/lib/colleges-api"
import type { College } from "@/types/college"

export default function AdminEditCollegePage({ params }: { params: Promise<{ id: string }> }) {
  const [college, setCollege] = React.useState<College | null | "loading">("loading")

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { id } = await params
        const res = await adminCollegesApi.get(id)
        if (!cancelled) setCollege(res.data)
      } catch {
        if (!cancelled) setCollege(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params])

  if (college === "loading") {
    return (
      <AdminLayout>
        <AdminDataTableHeader title="Edit College" />
        <div className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
          <div className="h-8 w-56 animate-pulse rounded bg-[var(--color-hairline-soft)]" />
        </div>
      </AdminLayout>
    )
  }

  if (!college) return notFound()

  return (
    <AdminLayout>
      <AdminDataTableHeader
        title={`Edit ${college.name}`}
        description={`${college.college_code} · /${college.slug}`}
      />
      <CollegeForm college={college} />
    </AdminLayout>
  )
}