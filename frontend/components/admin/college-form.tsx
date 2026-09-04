"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { FormField } from "@/components/forms/form-field"
import { useToast } from "@/components/ui/toast"
import { adminCollegesApi } from "@/lib/colleges-api"
import type { College } from "@/types/college"

interface CollegeFormProps {
  college?: College
}

type FormState = {
  name: string
  college_code: string
  official_name: string
  college_type: string
  is_private: boolean
  university_name: string
  state: string
  district: string
  city: string
  accreditation: string
  recognition: string
  established_year: string
  website: string
  email: string
  phone: string
  address: string
  pincode: string
  entrance_exam: string
  admission_status: string
  has_hostel: boolean
  latitude: string
  longitude: string
  google_maps_url: string
  google_place_id: string
  is_published: boolean
  source_name: string
  source_url: string
  verification_status: string
  last_verified_at: string
}

const empty: FormState = {
  name: "",
  college_code: "",
  official_name: "",
  college_type: "",
  is_private: true,
  university_name: "",
  state: "",
  district: "",
  city: "",
  accreditation: "",
  recognition: "",
  established_year: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  pincode: "",
  entrance_exam: "",
  admission_status: "",
  has_hostel: false,
  latitude: "",
  longitude: "",
  google_maps_url: "",
  google_place_id: "",
  is_published: false,
  source_name: "",
  source_url: "",
  verification_status: "unverified",
  last_verified_at: "",
}

export function CollegeForm({ college }: CollegeFormProps) {
  const isEdit = Boolean(college)
  const router = useRouter()
  const toast = useToast()
  const [form, setForm] = React.useState<FormState>(() => {
    if (!college) return empty
    return {
      name: college.name ?? "",
      college_code: college.college_code ?? "",
      official_name: college.official_name ?? "",
      college_type: college.college_type ?? "",
      is_private: college.is_private ?? true,
      university_name: college.university_name ?? "",
      state: college.state ?? college.location?.state ?? "",
      district: college.district ?? college.location?.district ?? "",
      city: college.city ?? college.location?.city ?? "",
      accreditation: college.accreditation ?? "",
      recognition: college.recognition ?? "",
      established_year: college.established_year ? String(college.established_year) : "",
      website: college.website ?? "",
      email: college.email ?? "",
      phone: college.phone ?? "",
      address: college.address ?? "",
      pincode: college.pincode ?? "",
      entrance_exam: college.entrance_exam ?? "",
      admission_status: college.admission_status ?? "",
      has_hostel: college.has_hostel ?? false,
      latitude: college.latitude != null ? String(college.latitude) : "",
      longitude: college.longitude != null ? String(college.longitude) : "",
      google_maps_url: college.google_maps_url ?? "",
      google_place_id: college.google_place_id ?? "",
      is_published: college.is_published ?? false,
      source_name: college.source_name ?? "",
      source_url: college.source_url ?? "",
      verification_status: college.verification_status ?? "unverified",
      last_verified_at: college.last_verified_at
        ? new Date(college.last_verified_at).toISOString().slice(0, 10)
        : "",
    }
  })
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) e.name = "College name is required"
    if (!form.college_code.trim()) e.college_code = "College code is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    const body: Partial<College> = {
      name: form.name,
      college_code: form.college_code,
      official_name: form.official_name || undefined,
      college_type: form.college_type || undefined,
      is_private: form.is_private,
      university_name: form.university_name || undefined,
      state: form.state || undefined,
      district: form.district || undefined,
      city: form.city || undefined,
      accreditation: form.accreditation || undefined,
      recognition: form.recognition || undefined,
      established_year: form.established_year ? Number(form.established_year) : undefined,
      website: form.website || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      pincode: form.pincode || undefined,
      entrance_exam: form.entrance_exam || undefined,
      admission_status: form.admission_status || undefined,
      has_hostel: form.has_hostel,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      google_maps_url: form.google_maps_url || undefined,
      google_place_id: form.google_place_id || undefined,
      is_published: form.is_published,
      source_name: form.source_name || undefined,
      source_url: form.source_url || undefined,
      verification_status: form.verification_status,
      last_verified_at: form.last_verified_at ? new Date(form.last_verified_at).toISOString() : undefined,
    }
    try {
      if (isEdit && college) {
        await adminCollegesApi.update(college.id, body)
        toast.success("College updated")
      } else {
        await adminCollegesApi.create(body)
        toast.success("College created")
      }
      router.push("/admin/colleges")
      router.refresh()
    } catch (err) {
      toast.error("Save failed", err instanceof Error ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic details */}
      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Basic details</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="College code" required error={errors.college_code} htmlFor="code">
            <Input id="code" value={form.college_code} onChange={(e) => set("college_code", e.target.value)} placeholder="COLLEGE000001" />
          </FormField>
          <FormField label="College name" required error={errors.name} htmlFor="name">
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Oxford Ayurveda Medical College" />
          </FormField>
          <FormField label="Official name" htmlFor="official">
            <Input id="official" value={form.official_name} onChange={(e) => set("official_name", e.target.value)} />
          </FormField>
          <FormField label="College type" htmlFor="type">
            <Select id="type" value={form.college_type} onChange={(e) => set("college_type", e.target.value)}>
              <option value="">Select type</option>
              <option value="dental">Dental</option>
              <option value="medical">Medical</option>
              <option value="engineering">Engineering</option>
              <option value="ayush">AYUSH</option>
              <option value="nursing">Nursing</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="paramedical">Paramedical</option>
            </Select>
          </FormField>
          <FormField label="Sector" htmlFor="sector">
            <Select id="sector" value={form.is_private ? "private" : "government"} onChange={(e) => set("is_private", e.target.value === "private")}>
              <option value="private">Private</option>
              <option value="government">Government</option>
            </Select>
          </FormField>
          <FormField label="Established year" htmlFor="year">
            <Input id="year" type="number" value={form.established_year} onChange={(e) => set("established_year", e.target.value)} placeholder="2005" />
          </FormField>
          <FormField label="Accreditation" htmlFor="acc">
            <Input id="acc" value={form.accreditation} onChange={(e) => set("accreditation", e.target.value)} placeholder="e.g. NAAC A" />
          </FormField>
          <FormField label="Recognition" htmlFor="rec">
            <Input id="rec" value={form.recognition} onChange={(e) => set("recognition", e.target.value)} placeholder="e.g. NMC approved" />
          </FormField>
          <FormField label="University" htmlFor="uni">
            <Input id="uni" value={form.university_name} onChange={(e) => set("university_name", e.target.value)} placeholder="e.g. Rajiv Gandhi University of Health Sciences" />
          </FormField>
          <FormField label="Admission status" htmlFor="adm">
            <Select id="adm" value={form.admission_status} onChange={(e) => set("admission_status", e.target.value)}>
              <option value="">Select</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="tentative">Tentative</option>
            </Select>
          </FormField>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Contact</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Website" htmlFor="web">
            <Input id="web" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
          </FormField>
          <FormField label="Email" htmlFor="em">
            <Input id="em" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <FormField label="Phone" htmlFor="ph">
            <Input id="ph" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </FormField>
          <FormField label="Address" htmlFor="addr">
            <Input id="addr" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, area…" />
          </FormField>
          <FormField label="Pincode" htmlFor="pin">
            <Input id="pin" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="560100" />
          </FormField>
          <FormField label="State" htmlFor="state">
            <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="e.g. Karnataka" />
          </FormField>
          <FormField label="District" htmlFor="district">
            <Input id="district" value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="e.g. Bengaluru Urban" />
          </FormField>
          <FormField label="City" htmlFor="city">
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Bengaluru" />
          </FormField>
          <FormField label="Entrance exam" htmlFor="ent">
            <Input id="ent" value={form.entrance_exam} onChange={(e) => set("entrance_exam", e.target.value)} placeholder="e.g. NEET, KCET" />
          </FormField>
        </div>
      </section>

      {/* Geo */}
      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Location & map</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Latitude" htmlFor="lat">
            <Input id="lat" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="12.9716" />
          </FormField>
          <FormField label="Longitude" htmlFor="lng">
            <Input id="lng" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="77.5946" />
          </FormField>
          <FormField label="Google Maps URL" htmlFor="gm">
            <Input id="gm" value={form.google_maps_url} onChange={(e) => set("google_maps_url", e.target.value)} placeholder="https://maps.google.com/…" />
          </FormField>
          <FormField label="Google Place ID" htmlFor="gp">
            <Input id="gp" value={form.google_place_id} onChange={(e) => set("google_place_id", e.target.value)} />
          </FormField>
        </div>
      </section>

      {/* Verification */}
      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <h3 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Data source & verification</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Source name" htmlFor="srcn">
            <Input id="srcn" value={form.source_name} onChange={(e) => set("source_name", e.target.value)} placeholder="Official college website" />
          </FormField>
          <FormField label="Source URL" htmlFor="srcul">
            <Input id="srcul" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} placeholder="https://…" />
          </FormField>
          <FormField label="Verification status" htmlFor="vs">
            <Select id="vs" value={form.verification_status} onChange={(e) => set("verification_status", e.target.value)}>
              <option value="unverified">Unverified</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </Select>
          </FormField>
          <FormField label="Last verified date" htmlFor="lvd">
            <Input id="lvd" type="date" value={form.last_verified_at} onChange={(e) => set("last_verified_at", e.target.value)} />
          </FormField>
        </div>
      </section>

      {/* Publish + toggles */}
      <section className="rounded-lg hairline-border bg-[var(--color-canvas-elevated)] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-2 text-sm text-[var(--color-body)]">
            <input
              type="checkbox"
              checked={form.has_hostel}
              onChange={(e) => set("has_hostel", e.target.checked)}
              className="h-4 w-4"
            />
            Has hostel
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-body)]">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => set("is_published", e.target.checked)}
              className="h-4 w-4"
            />
            Published (visible on site)
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create college"}
        </Button>
        <Button type="button" variant="ghost-sm" onClick={() => router.push("/admin/colleges")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}