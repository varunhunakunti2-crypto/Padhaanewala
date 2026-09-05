"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { enquiriesApi } from "@/lib/api"

interface AdmissionAssistanceFormProps {
  collegeName: string
  collegeState?: string | null
  courses?: string[]
}

type FieldErrors = Partial<Record<"name" | "mobile" | "email", string>>

const INVALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVALID_PHONE = /^[0-9+\-\s()]{10,15}$/

export function AdmissionAssistanceForm({
  collegeName,
  collegeState,
  courses,
}: AdmissionAssistanceFormProps) {
  const [name, setName] = React.useState("")
  const [mobile, setMobile] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [course, setCourse] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [state, setState] = React.useState<"idle" | "submitting" | "success" | "error">("idle")

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors: FieldErrors = {}
    if (name.trim().length < 2) nextErrors.name = "Please enter your full name"
    if (!INVALID_PHONE.test(mobile.trim())) {
      nextErrors.mobile = "Enter a valid 10-digit mobile number"
    }
    if (email && !INVALID_EMAIL.test(email.trim())) {
      nextErrors.email = "Enter a valid email address"
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setState("submitting")
    try {
      await enquiriesApi.submit({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        course: course.trim() || undefined,
        preferred_college: collegeName,
        state: collegeState ?? undefined,
        message: message.trim() || undefined,
        source: "college-detail",
      })
      setState("success")
    } catch {
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div
        className="rounded-md border border-hairline bg-canvas-elevated p-6 text-center"
        role="status"
      >
        <CheckCircle2 className="mx-auto h-9 w-9 text-link" aria-hidden />
        <h3 className="mt-3 font-geist-sans text-[18px] font-semibold text-ink">
          Enquiry received
        </h3>
        <p className="mt-2 text-[14px] leading-5 text-body">
          Thank you, {name.trim()}. A Padhaanewala counsellor will contact you on{" "}
          <span className="font-medium text-ink">{mobile.trim()}</span> shortly to
          help with admission to {collegeName}.
        </p>
        <p className="mt-3 text-[12px] text-mute">
          This is an assistance request only — it is not an admission application.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="text-[13px] text-body">
        Request free, no-obligation admission guidance for{" "}
        <span className="font-medium text-ink">{collegeName}</span>. A counsellor
        will call you back.
      </div>

      {state === "error" ? (
        <p
          className="rounded-md border border-error/30 bg-red-50 px-3 py-2 text-[13px] text-error-deep"
          role="alert"
        >
          We couldn&apos;t submit your request right now. Please try again or call us.
        </p>
      ) : null}

      <FormField label="Full name" htmlFor="aa-name" required error={errors.name}>
        <Input
          id="aa-name"
          name="name"
          autoComplete="name"
          placeholder="e.g. Ananya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
        />
      </FormField>

      <FormField label="Mobile number" htmlFor="aa-mobile" required error={errors.mobile}>
        <Input
          id="aa-mobile"
          name="mobile"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="10-digit mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          aria-invalid={Boolean(errors.mobile)}
        />
      </FormField>

      <FormField label="Email (optional)" htmlFor="aa-email" error={errors.email}>
        <Input
          id="aa-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
      </FormField>

      {courses && courses.length > 0 ? (
        <FormField label="Course interested in (optional)" htmlFor="aa-course">
          <Input
            id="aa-course"
            name="course"
            list="aa-course-options"
            placeholder="e.g. B.Tech Computer Science"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
          <datalist id="aa-course-options">
            {courses.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FormField>
      ) : null}

      <FormField label="Your query (optional)" htmlFor="aa-message">
        <Textarea
          id="aa-message"
          name="message"
          rows={3}
          placeholder="Tell us briefly what you need help with — eligibility, documents, etc."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </FormField>

      <Button type="submit" variant="primary" className="w-full" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Request Admission Assistance"}
      </Button>
      <p className="text-[12px] leading-4 text-mute">
        By submitting you agree to be contacted about admissions. This is guidance
        only — always verify final details with the institution.
      </p>
    </form>
  )
}