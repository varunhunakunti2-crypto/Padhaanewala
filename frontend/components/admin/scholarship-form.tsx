"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/forms/form-field"
import { useToast } from "@/components/ui/toast"
import { adminScholarshipsApi } from "@/lib/scholarships-api"
import type { Scholarship } from "@/types/scholarship"

interface ScholarshipFormProps {
  scholarship?: Scholarship
  courseOptions?: { id: string; name: string }[]
}

type FormState = {
  name: string
  provider_name: string
  is_government: boolean
  description: string
  amount: string
  eligibility_criteria: string
  income_criteria: string
  deadline: string
  documents: string
  application_procedure: string
  official_application_url: string
  status: string
  states: string
  course_ids: string[]
  source_name: string
  source_url: string
  verification_status: string
  last_verified_at: string
}

const empty: FormState = {
  name: "",
  provider_name: "",
  is_government: true,
  description: "",
  amount: "",
  eligibility_criteria: "",
  income_criteria: "",
  deadline: "",
  documents: "",
  application_procedure: "",
  official_application_url: "",
  status: "active",
  states: "",
  course_ids: [],
  source_name: "",
  source_url: "",
  verification_status: "unverified",
  last_verified_at: "",
}

export function ScholarshipForm({ scholarship, courseOptions = [] }: ScholarshipFormProps) {
  const isEdit = Boolean(scholarship)
  const router = useRouter()
  const toast = useToast()
  const [form, setForm] = React.useState<FormState>(() => {
    if (!scholarship) return empty
    return {
      name: scholarship.name ?? "",
      provider_name: scholarship.provider_name ?? "",
      is_government: scholarship.is_government ?? true,
      description: scholarship.description ?? "",
      amount: scholarship.amount != null ? String(scholarship.amount) : "",
      eligibility_criteria: scholarship.eligibility_criteria ?? "",
      income_criteria: scholarship.income_criteria ?? "",
      deadline: scholarship.deadline ? scholarship.deadline.slice(0, 10) : "",
      documents: scholarship.documents ?? "",
      application_procedure: scholarship.application_procedure ?? "",
      official_application_url: scholarship.official_application_url ?? "",
      status: scholarship.status ?? "active",
      states: (scholarship.states ?? []).join(", "),
      course_ids: (scholarship as unknown as { course_ids?: string[] }).course_ids ?? [],
      source_name: scholarship.source_name ?? "",
      source_url: scholarship.source_url ?? "",
      verification_status: scholarship.verification_status ?? "unverified",
      last_verified_at: scholarship.last_verified_at
        ? new Date(scholarship.last_verified_at).toISOString().slice(0, 10)
        : "",
    }
  })
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const toggleCourse = (id: string) => {
    set("course_ids", form.course_ids.includes(id) ? form.course_ids.filter((c) => c !== id) : [...form.course_ids, id])
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) e.name = "Scholarship name is required"
    if (!form.provider_name.trim()) e.provider_name = "Provider is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    const body: Record<string, unknown> = {
      name: form.name,
      provider_name: form.provider_name,
      is_government: form.is_government,
      description: form.description || undefined,
      amount: form.amount ? Number(form.amount) : undefined,
      eligibility_criteria: form.eligibility_criteria || undefined,
      income_criteria: form.income_criteria || undefined,
      deadline: form.deadline || undefined,
      documents: form.documents || undefined,
      application_procedure: form.application_procedure || undefined,
      official_application_url: form.official_application_url || undefined,
      status: form.status,
      states: form.states.split(",").map((s) => s.trim()).filter(Boolean),
      course_ids: form.course_ids,
      source_name: form.source_name || undefined,
      source_url: form.source_url || undefined,
      verification_status: form.verification_status,
      last_verified_at: form.last_verified_at ? new Date(form.last_verified_at).toISOString() : undefined,
    }
    try {
      if (isEdit && scholarship) {
        await adminScholarshipsApi.update(scholarship.id, body)
        toast.success("Scholarship updated")
      } else {
        await adminScholarshipsApi.create(body)
        toast.success("Scholarship created")
      }
      router.push("/admin/scholarships")
      router.refresh()
    } catch (err) {
      toast.error("Save failed", err instanceof Error ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Basic details</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Scholarship name" required error={errors.name} htmlFor="name">
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. National Means-cum-Merit Scholarship" />
          </FormField>
          <FormField label="Provider name" required error={errors.provider_name} htmlFor="provider">
            <Input id="provider" value={form.provider_name} onChange={(e) => set("provider_name", e.target.value)} placeholder="e.g. Ministry of Education, Government of India" />
          </FormField>
          <FormField label="Amount (₹, optional)" htmlFor="amount">
            <Input id="amount" type="number" inputMode="numeric" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="e.g. 12000" />
          </FormField>
          <FormField label="Deadline (optional)" htmlFor="deadline">
            <Input id="deadline" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">Active (open)</option>
              <option value="expired">Expired</option>
              <option value="draft">Draft</option>
            </Select>
          </FormField>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="govt" checked={form.is_government} onChange={(e) => set("is_government", e.target.checked)} />
            <label htmlFor="govt" className="text-sm text-[var(--color-ink)]">Government scheme</label>
          </div>
        </div>
        <div className="mt-4">
          <FormField label="Description" htmlFor="description">
            <Textarea id="description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </FormField>
        </div>
      </section>

      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Eligibility & coverage</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Eligibility criteria" htmlFor="eligibility">
            <Textarea id="eligibility" rows={4} value={form.eligibility_criteria} onChange={(e) => set("eligibility_criteria", e.target.value)} />
          </FormField>
          <FormField label="Income criteria" htmlFor="income">
            <Textarea id="income" rows={4} value={form.income_criteria} onChange={(e) => set("income_criteria", e.target.value)} />
          </FormField>
          <FormField label="States (comma separated)" htmlFor="states">
            <Input id="states" value={form.states} onChange={(e) => set("states", e.target.value)} placeholder="e.g. Karnataka, Tamil Nadu" />
          </FormField>
          <div>
            <p className="mb-1.5 mt-1 text-sm font-medium text-[var(--color-ink)]">Courses</p>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border hairline-border p-2">
              {courseOptions.length === 0 ? (
                <p className="text-xs text-[var(--color-mute)]">No courses available yet.</p>
              ) : (
                courseOptions.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-[var(--color-body)]">
                    <Checkbox checked={form.course_ids.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                    {c.name}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Application</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Application procedure" htmlFor="procedure">
            <Textarea id="procedure" rows={4} value={form.application_procedure} onChange={(e) => set("application_procedure", e.target.value)} />
          </FormField>
          <FormField label="Documents required" htmlFor="documents">
            <Textarea id="documents" rows={3} value={form.documents} onChange={(e) => set("documents", e.target.value)} />
          </FormField>
          <FormField label="Official application URL" htmlFor="official-url" hint="Start with http:// or https://">
            <Input id="official-url" type="url" value={form.official_application_url} onChange={(e) => set("official_application_url", e.target.value)} placeholder="https://scholarships.gov.in/..." />
          </FormField>
        </div>
      </section>

      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Source & verification</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Source name" htmlFor="source-name">
            <Input id="source-name" value={form.source_name} onChange={(e) => set("source_name", e.target.value)} placeholder="e.g. National Scholarship Portal" />
          </FormField>
          <FormField label="Source URL" htmlFor="source-url">
            <Input id="source-url" type="url" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} />
          </FormField>
          <FormField label="Verification status" htmlFor="verification">
            <Select id="verification" value={form.verification_status} onChange={(e) => set("verification_status", e.target.value)}>
              <option value="unverified">Unverified</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </Select>
          </FormField>
          <FormField label="Last verified date" htmlFor="verified-at">
            <Input id="verified-at" type="date" value={form.last_verified_at} onChange={(e) => set("last_verified_at", e.target.value)} />
          </FormField>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create scholarship"}
        </Button>
        <Button type="button" variant="ghost-sm" asChild>
          <Link href="/admin/scholarships">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}