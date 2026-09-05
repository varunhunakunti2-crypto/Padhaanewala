import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Coins,
  ExternalLink,
  FileText,
  Landmark,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BreadcrumbItem, Breadcrumbs } from "@/components/ui/breadcrumbs"
import { scholarshipsPublicApi } from "@/lib/scholarships-api"
import { AdmissionAssistanceForm } from "@/components/college/admission-assistance-form"
import type { ScholarshipDetail } from "@/types/scholarship"

interface PageProps {
  params: Promise<{ slug: string }>
}

const SITE = "https://padhaanewala.in"

export const revalidate = 3600

function buildDescription(s: ScholarshipDetail): string {
  const type = s.is_government ? "government" : "private"
  const provider = s.provider_name || "provider"
  const amount = s.amount != null ? ` up to ₹${s.amount.toLocaleString("en-IN")}` : ""
  const deadline = s.deadline
    ? ` Deadline ${new Date(s.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`
    : ""
  return `${s.name} is a ${type} scholarship${amount ? ` worth${amount}` : ""} offered by ${provider}${s.states.length ? ` for students in ${s.states.join(", ")}` : ""}${s.course_names.length ? ` (${s.course_names.join(", ")})` : ""}.${deadline} Verify eligibility and apply via the official application link.`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const { data } = await scholarshipsPublicApi.getBySlug(slug, { revalidate: 3600, tags: ["scholarships"] })
    const url = `${SITE}/scholarships/${data.slug}`
    return {
      title: `${data.name} — Eligibility, Amount, Deadline & Apply`,
      description: buildDescription(data),
      alternates: { canonical: url },
      openGraph: {
        title: `${data.name} | Padhaanewala`,
        description: buildDescription(data),
        url,
        type: "website",
        siteName: "Padhaanewala",
        locale: "en_IN",
      },
      robots: { index: true, follow: true },
    }
  } catch {
    return { title: "Scholarship Details", robots: { index: false } }
  }
}

export default async function ScholarshipDetailPage({ params }: PageProps) {
  const { slug } = await params
  let data: ScholarshipDetail
  try {
    ;({ data } = await scholarshipsPublicApi.getBySlug(slug, { revalidate: 3600, tags: ["scholarships"] }))
  } catch {
    notFound()
  }

  const url = `${SITE}/scholarships/${data.slug}`
  const verified = data.verification_status === "verified"
  const formattedDeadline = data.deadline
    ? new Date(data.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ScholarshipOrFinancialAid" as string,
      "@id": `${url}#scholarship`,
      name: data.name,
      provider: { "@type": "Organization", name: data.provider_name },
      url,
      amount: data.amount != null ? { "@type": "MonetaryAmount", currency: "INR", value: data.amount } : undefined,
      makesOffer: data.eligibility_criteria
        ? { "@type": "Offer", description: data.eligibility_criteria }
        : undefined,
      relevantLocation: data.states.length
        ? data.states.map((s) => ({ "@type": "Place", name: s }))
        : undefined,
    },
    data.status === "active" && data.deadline
      ? {
          "@context": "https://schema.org",
          "@type": "SpecialAnnouncement" as string,
          name: `${data.name} — applications open`,
          url,
          announcementDate: data.last_verified_at,
          expires: data.deadline,
        }
      : null,
  ].filter(Boolean)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}

      <Breadcrumbs className="mb-6">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/scholarships">Scholarships</BreadcrumbItem>
        <BreadcrumbItem isLast>{data.name}</BreadcrumbItem>
      </Breadcrumbs>

      {/* Header */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={data.is_government ? "secondary" : "outline"}>
            {data.is_government ? <Landmark className="mr-1 h-3.5 w-3.5" aria-hidden /> : <Building2 className="mr-1 h-3.5 w-3.5" aria-hidden />}
            {data.is_government ? "Government scheme" : "Private"}
          </Badge>
          <Badge variant={data.status === "active" ? "success" : data.status === "expired" ? "error" : "warning"}>
            {data.status === "active"
              ? "Applications open"
              : data.status === "expired"
                ? "Deadline passed"
                : "Draft"}
          </Badge>
        </div>
        <h1 className="mt-3 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink sm:text-[40px] sm:leading-[44px]">
          {data.name}
        </h1>
        <p className="mt-1 text-[15px] text-body">Offered by {data.provider_name}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[14px] text-body">
          {data.amount != null ? (
            <span className="inline-flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-mute" aria-hidden /> Up to ₹{data.amount.toLocaleString("en-IN")}
            </span>
          ) : null}
          {formattedDeadline ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-mute" aria-hidden /> Deadline: {formattedDeadline}
            </span>
          ) : null}
          {data.states.length ? (
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-mute" aria-hidden /> {data.states.join(", ")}
            </span>
          ) : null}
        </div>
        {verified ? (
          <p className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-link">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Verified source
            {data.source_name ? <span className="text-mute">· {data.source_name}</span> : null}
            {data.last_verified_at ? (
              <span className="text-mute">
                · verified{" "}
                {new Date(data.last_verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="mt-4 text-[13px] text-mute">Information should be confirmed with the official provider.</p>
        )}
      </header>

      <div className="mt-8 space-y-8">
        {/* Description */}
        {data.description ? (
          <section>
            <SectionHeading>About this scholarship</SectionHeading>
            <p className="mt-3 text-[15px] leading-6 text-body">{data.description}</p>
          </section>
        ) : null}

        {/* Amount */}
        {data.amount != null ? (
          <section>
            <SectionHeading>Scholarship amount</SectionHeading>
            <div className="mt-3 rounded-md border border-hairline bg-canvas-elevated p-5">
              <p className="font-geist-sans text-[28px] font-semibold text-ink">
                ₹{data.amount.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-[13px] text-mute">Exact award may vary by eligibility and rank — verify with the provider.</p>
            </div>
          </section>
        ) : null}

        {/* Eligibility + income */}
        {(data.eligibility_criteria || data.income_criteria) ? (
          <section>
            <SectionHeading>Eligibility</SectionHeading>
            {data.eligibility_criteria ? (
              <p className="mt-3 text-[15px] leading-6 text-body">{data.eligibility_criteria}</p>
            ) : null}
            {data.income_criteria ? (
              <div className="mt-3 rounded-md border border-hairline bg-canvas-elevated p-4">
                <p className="text-[12px] font-medium uppercase tracking-wide text-mute">Income criteria</p>
                <p className="mt-1 text-[14px] text-body">{data.income_criteria}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Courses + states */}
        {(data.course_names.length > 0 || data.states.length > 0) ? (
          <section>
            <SectionHeading>Courses & states covered</SectionHeading>
            {data.course_names.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {data.course_names.map((c) => (
                  <span key={c} className="rounded-pill-category border border-hairline bg-canvas-elevated px-3.5 py-1.5 text-[13px] text-ink">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            {data.states.length > 0 ? (
              <p className="mt-2 text-[13px] text-body">States: {data.states.join(", ")}</p>
            ) : null}
          </section>
        ) : null}

        {/* Application procedure */}
        {data.application_procedure ? (
          <section>
            <SectionHeading>Application procedure</SectionHeading>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-6 text-body">{data.application_procedure}</p>
          </section>
        ) : null}

        {/* Documents */}
        {data.documents ? (
          <section>
            <SectionHeading>Documents required</SectionHeading>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-6 text-body">{data.documents}</p>
          </section>
        ) : null}

        {/* Source / verification */}
        {(data.source_name || data.source_url || data.last_verified_at) ? (
          <section>
            <SectionHeading>Source & verification</SectionHeading>
            <div className="mt-3 rounded-md border border-hairline bg-canvas-elevated p-4 text-[13px] text-body">
              <p className="inline-flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-mute" aria-hidden />
                {data.source_name ?? "Official source"}
                {data.last_verified_at ? ` · verified ${new Date(data.last_verified_at).toLocaleDateString("en-IN")}` : ""}
              </p>
              {data.source_url ? (
                <a href={data.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-link hover:text-link-deep">
                  View original source <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Dual CTA — strongly distinguished */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border-2 border-link/40 bg-canvas-elevated p-5">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-link-deep">
              <ExternalLink className="h-4 w-4" aria-hidden /> Official application
            </p>
            <h3 className="mt-2 font-geist-sans text-[18px] font-semibold text-ink">{data.name}</h3>
            <p className="mt-1 text-[13px] text-body">Apply directly on the official {data.provider_name} portal. Padhaanewala does not collect or process your application.</p>
            {data.official_application_url && data.status === "active" ? (
              <Button variant="primary" className="mt-4 w-full" asChild>
                <a href={data.official_application_url} target="_blank" rel="noopener noreferrer">
                  Go to official application <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            ) : (
              <Button variant="primary" className="mt-4 w-full" disabled>
                {data.status === "expired" ? "Deadline passed" : "Official link not available"}
              </Button>
            )}
          </div>

          <div className="rounded-md border border-hairline bg-canvas-elevated p-5">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-mute">
              <LifeBuoy className="h-4 w-4" aria-hidden /> Padhaanewala assistance
            </p>
            <h3 className="mt-2 font-geist-sans text-[18px] font-semibold text-ink">Free counselling</h3>
            <p className="mt-1 text-[13px] text-body">Chat with a counsellor to check if you qualify and how to apply. This is guidance — we never process applications on your behalf.</p>
            <AdmissionAssistanceForm
              collegeName={`${data.name} scholarship`}
              collegeState={data.states[0] ?? undefined}
              courses={data.course_names}
            />
          </div>
        </section>

        {/* Note */}
        <p className="text-[12px] leading-4 text-mute">
          {data.status === "active" ? "Applications currently open." : "Deadline passed — check the official portal for the next cycle."}{" "}
          The official application link and this page&apos;s details come from the verified Padhaanewala database. Always apply through the official source.
        </p>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">{children}</h2>
}