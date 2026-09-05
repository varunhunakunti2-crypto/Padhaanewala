import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  MapPin,
  Star,
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  BedDouble,
  CalendarCheck,
  ChevronDown,
  CircleAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BreadcrumbItem, Breadcrumbs } from "@/components/ui/breadcrumbs"
import { collegesPublicApi } from "@/lib/colleges-api"
import { CompareButton } from "@/components/college/compare-button"
import { SaveCollegeButton } from "@/components/college/save-college-button"
import { AdmissionAssistanceForm } from "@/components/college/admission-assistance-form"
import type { CollegeDetail } from "@/types/college"

interface PageProps {
  params: Promise<{ slug: string }>
}

const SITE = "https://padhaanewala.in"
const REVALIDATE_SECONDS = 3600

export const revalidate = REVALIDATE_SECONDS

function buildDescription(d: CollegeDetail): string {
  const type = d.college_type ?? "college"
  const sector = d.is_private ? "private" : "government"
  const where = [d.location?.city, d.location?.state].filter(Boolean).join(", ")
  const course = d.courses[0]?.course_name
  const fee = d.courses
    .map((c) => c.fees)
    .filter((f): f is number => typeof f === "number" && f > 0)
    .sort((a, b) => a - b)[0]
  const bits: string[] = []
  if (course) bits.push(`top ${course}`)
  if (fee != null) bits.push(`fees from ₹${fee.toLocaleString("en-IN")}/year`)
  bits.push("eligibility, cutoffs and verified reviews")
  const suffix = where ? ` Explore ${bits.join(", ")} for ${d.name} in ${where}.` : ` Explore ${bits.join(", ")} for ${d.name}.`
  return `${d.name} is a ${type} ${sector} college${where ? ` in ${where}` : ""}.${suffix} Get free, no-obligation admission assistance.`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const { data } = await collegesPublicApi.detail(slug, {
      revalidate: REVALIDATE_SECONDS,
      tags: ["colleges"],
    })
    const url = `${SITE}/college/${data.slug}`
    const description = buildDescription(data)
    const image = data.gallery[0]?.url
    const keywords = [
      data.name,
      data.official_name && data.official_name !== data.name ? data.official_name : null,
      data.location?.city,
      data.location?.state,
      data.college_type && `${data.college_type} college`,
      "admissions",
      "fees",
      "cutoff",
      "courses",
      "reviews",
    ].filter(Boolean) as string[]

    return {
      title: `${data.name} — Admissions, Fees, Cutoff & Reviews`,
      description,
      keywords,
      category: "Education",
      alternates: { canonical: url },
      openGraph: {
        title: `${data.name} — Admissions, Fees, Cutoff & Reviews`,
        description,
        url,
        type: "website",
        siteName: "Padhaanewala",
        locale: "en_IN",
        images: image
          ? [{ url: image, alt: data.gallery[0]?.alt_text ?? `${data.name} gallery` }]
          : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: `${data.name} — Admissions, Fees, Cutoff & Reviews`,
        description,
        images: image
          ? [{ url: image, alt: data.gallery[0]?.alt_text ?? `${data.name} gallery` }]
          : undefined,
      },
      robots: { index: true, follow: true },
      ...(image
        ? { other: { "og:image:secure_url": image } }
        : {}),
    }
  } catch {
    return {
      title: "College — Admissions, Fees, Cutoff & Reviews",
      robots: { index: false, follow: false },
    }
  }
}

function jsonLd(value: unknown) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }}
    />
  )
}

function collegeJsonLd(d: CollegeDetail) {
  const url = `${SITE}/college/${d.slug}`
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${url}#college`,
    name: d.name,
    ...(d.official_name && d.official_name !== d.name
      ? { alternateName: d.official_name }
      : {}),
    url,
...(d.gallery[0]?.url ? { image: d.gallery[0].url } : {}),
      description: buildDescription(d),
    ...(d.phone ? { telephone: d.phone } : {}),
    ...(d.email ? { email: d.email } : {}),
    address: {
      "@type": "PostalAddress",
      ...(d.address ? { streetAddress: d.address } : {}),
      ...(d.location?.city ? { addressLocality: d.location.city } : {}),
      ...(d.location?.state ? { addressRegion: d.location.state } : {}),
      ...(d.pincode ? { postalCode: d.pincode } : {}),
      addressCountry: "IN",
    },
    ...(d.latitude != null && d.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: d.latitude,
            longitude: d.longitude,
          },
        }
      : {}),
    ...(d.website || d.google_maps_url
      ? { sameAs: [d.website, d.google_maps_url].filter(Boolean) }
      : {}),
    ...(d.rating != null && d.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: d.rating,
            reviewCount: d.reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(d.reviews.length > 0
      ? {
          review: d.reviews.slice(0, 3).map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
            },
            ...(r.title ? { name: r.title } : {}),
            ...(r.content ? { reviewBody: r.content } : {}),
            datePublished: r.created_at,
          })),
        }
      : {}),
    ...(d.courses.length > 0
      ? {
          hasCourse: d.courses.map((c) => ({
            "@type": "Course",
            "@id": `${url}#course-${c.course_id}`,
            name: c.course_name,
            ...(c.level ? { learningResourceType: c.level } : {}),
            provider: { "@type": "CollegeOrUniversity", name: d.name, url },
            ...(c.fees != null
              ? {
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: "onsite",
                    courseWorkload: c.duration_months
                      ? `PT${c.duration_months}M`
                      : undefined,
                    totalPaymentDue: {
                      "@type": "MonetaryAmount",
                      currency: "INR",
                      value: c.fees,
                    },
                  },
                }
              : {}),
          })),
        }
      : {}),
    ...(d.entrance_exam
      ? {
          admission: {
            "@type": "EducationalOccupationalProgram",
            ...(d.entrance_exam ? { title: `Admission via ${d.entrance_exam}` } : {}),
            ...(d.admission_process ? { description: d.admission_process } : {}),
          },
        }
      : {}),
  }
}

function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }
}

function breadcrumbJsonLd(d: CollegeDetail) {
  const items = [
    { position: 1, name: "Home", item: SITE },
    { position: 2, name: "Colleges", item: `${SITE}/colleges` },
  ]
  if (d.location?.state) {
    const stateLink = `${SITE}/colleges?state=${encodeURIComponent(d.location.state)}`
    items.push({ position: 3, name: `${d.location.state} colleges`, item: stateLink })
  }
  items.push({
    position: items.length + 1,
    name: d.name,
    item: `${SITE}/college/${d.slug}`,
  })
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it) => ({ "@type": "ListItem", ...it })),
  }
}

const SECTION_TOC: { id: string; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses & Fees" },
  { id: "eligibility", label: "Eligibility" },
  { id: "admission", label: "Admission Process" },
  { id: "cutoffs", label: "Cutoffs" },
  { id: "facilities", label: "Facilities" },
  { id: "reviews", label: "Reviews" },
  { id: "gallery", label: "Gallery" },
  { id: "faqs", label: "FAQs" },
]

export default async function CollegeDetailPage({ params }: PageProps) {
  const { slug } = await params
  let data: CollegeDetail
  try {
    ;({ data } = await collegesPublicApi.detail(slug, {
      revalidate: REVALIDATE_SECONDS,
      tags: ["colleges"],
    }))
  } catch {
    notFound()
  }

  const loc = data.location
  const locStr = [loc?.city, loc?.district, loc?.state].filter(Boolean).join(", ")
  const verified = data.verification_status === "verified"
  const reviewCount = data.reviews.length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {jsonLd(collegeJsonLd(data))}
      {data.faqs.length > 0 ? jsonLd(faqJsonLd(data.faqs)) : null}
      {jsonLd(breadcrumbJsonLd(data))}

      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/colleges">Colleges</BreadcrumbItem>
        {loc?.state ? <BreadcrumbItem>{loc.state}</BreadcrumbItem> : null}
        <BreadcrumbItem isLast>{data.name}</BreadcrumbItem>
      </Breadcrumbs>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
              College profile
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {data.college_type ? (
                <Badge variant="category-pill">{data.college_type} college</Badge>
              ) : (
                <Badge variant="category-pill">College</Badge>
              )}
              <Badge variant="outline">{data.is_private ? "Private" : "Government"}</Badge>
              <AdmissionStatusBadge status={data.admission_status} />
            </div>

            <h1 className="mt-3 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink sm:text-[44px] sm:leading-[48px]">
              {data.name}
            </h1>

            {data.official_name && data.official_name !== data.name ? (
              <p className="mt-1 text-[14px] text-body">Official name: {data.official_name}</p>
            ) : null}

            {locStr ? (
              <p className="mt-2 flex items-center gap-1.5 text-[15px] text-body">
                <MapPin className="h-4 w-4 text-mute" aria-hidden />
                {locStr}
                {data.pincode ? ` - ${data.pincode}` : ""}
              </p>
            ) : null}

            {data.rating != null ? (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-body">
                <span className="inline-flex items-center gap-1 font-medium text-ink">
                  <Star className="h-4 w-4 fill-ink text-ink" aria-hidden />
                  {data.rating.toFixed(1)}
                  <span className="sr-only">out of 5</span>
                </span>
                <span className="text-mute">
                  {reviewCount === 0
                    ? "No reviews yet"
                    : `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`}
                </span>
              </p>
            ) : null}

            {/* Verification / source */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
              {verified ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-link">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Verified college
                  {data.source_name ? <span className="text-mute">· {data.source_name}</span> : null}
                  {data.last_verified_at ? (
                    <span className="text-mute">
                      · verified{" "}
                      {new Date(data.last_verified_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-mute">
                  <CircleAlert className="h-4 w-4" aria-hidden />
                  Information on this profile should be confirmed with the institution
                </span>
              )}
              {data.source_url ? (
                <a
                  href={data.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-link hover:text-link-deep"
                >
                  View source <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" asChild>
              <a href="#admission-assistance">Get Admission Help</a>
            </Button>
            {data.website ? (
              <Button variant="secondary" asChild>
                <a href={data.website} target="_blank" rel="noopener noreferrer">
                  Apply on official website <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            ) : null}
            <CompareButton slug={data.slug} name={data.name} />
            <SaveCollegeButton slug={data.slug} name={data.name} />
          </div>
        </div>

        {/* Contact strip */}
        {(data.website || data.email || data.phone) && (
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 rounded-md border border-hairline bg-canvas-elevated p-4 text-[14px] text-body">
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-link"
              >
                <Globe className="h-4 w-4 text-mute" aria-hidden /> Website
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 hover:text-link">
                <Mail className="h-4 w-4 text-mute" aria-hidden /> {data.email}
              </a>
            )}
            {data.phone && (
              <a href={`tel:${data.phone}`} className="inline-flex items-center gap-1.5 hover:text-link">
                <Phone className="h-4 w-4 text-mute" aria-hidden /> {data.phone}
              </a>
            )}
            {data.has_hostel && (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-mute" aria-hidden /> Hostel available
              </span>
            )}
          </div>
        )}
      </header>

      {/* On this page */}
      <nav aria-label="On this page" className="mb-10 -mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex gap-2">
          {SECTION_TOC.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex items-center rounded-pill-category border border-hairline bg-canvas-elevated px-4 py-1.5 text-[13px] font-medium text-body hover:border-ink hover:text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-12 lg:col-span-2">
          {/* Overview */}
          <section id="overview" aria-labelledby="overview-heading">
            <SectionHeading eyebrow="College profile" id="overview-heading">
              Overview
            </SectionHeading>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow label="Established" value={data.established_year ? String(data.established_year) : undefined} />
              <InfoRow label="Type" value={data.college_type ? `${data.college_type} college` : undefined} />
              <InfoRow label="Ownership" value={data.is_private ? "Private" : "Government"} />
              <InfoRow label="University" value={data.university_name} />
              <InfoRow label="Accreditation" value={data.accreditation} />
              <InfoRow label="Recognition" value={data.recognition} />
              <InfoRow label="Entrance exam" value={data.entrance_exam} />
              <InfoRow label="Admission status" value={data.admission_status ? data.admission_status.charAt(0).toUpperCase() + data.admission_status.slice(1) : undefined} />
            </dl>
          </section>

          {/* Courses & Fees */}
          {data.courses.length > 0 && (
            <section id="courses" aria-labelledby="courses-heading">
              <SectionHeading eyebrow="Programmes offered" id="courses-heading">
                Courses & Fees
              </SectionHeading>
              <div className="mt-4 overflow-x-auto rounded-md border border-hairline">
                <table className="w-full text-sm">
                  <thead className="bg-hairline-soft">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Course</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Level</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Duration</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Intake</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline bg-canvas-elevated">
                    {data.courses.map((c) => (
                      <tr key={c.course_id}>
                        <td className="px-4 py-3 font-medium text-ink">{c.course_name}</td>
                        <td className="px-4 py-3 text-body">{c.level ?? "—"}</td>
                        <td className="px-4 py-3 text-body">
                          {c.duration_months ? `${c.duration_months} months` : "—"}
                        </td>
                        <td className="px-4 py-3 text-body">
                          {c.intake != null ? `${c.intake} seats` : "—"}
                        </td>
                        <td className="px-4 py-3 text-body">
                          {c.fees != null ? (
                            <>₹{c.fees.toLocaleString("en-IN")}<span className="text-mute"> / year</span></>
                          ) : (
                            <span className="text-mute">Approximate</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <SourceNote
                text="Fees shown are indicative / most-recently-known figures for the current academic cycle. Always verify exact fees with the institution before admission."
                data={data}
              />
            </section>
          )}

          {/* Eligibility */}
          {data.eligibility && (
            <section id="eligibility" aria-labelledby="eligibility-heading">
              <SectionHeading eyebrow="Who can apply" id="eligibility-heading">
                Eligibility
              </SectionHeading>
              <div className="mt-4 rounded-md border border-hairline bg-canvas-elevated p-5">
                <p className="text-[14px] leading-6 text-body">{data.eligibility}</p>
              </div>
              <SourceNote data={data} />
            </section>
          )}

          {/* Admission process */}
          {data.admission_process && (
            <section id="admission" aria-labelledby="admission-heading">
              <SectionHeading eyebrow="How to apply" id="admission-heading">
                Admission Process
              </SectionHeading>
              <div className="mt-4 rounded-md border border-hairline bg-canvas-elevated p-5">
                <p className="whitespace-pre-line text-[14px] leading-6 text-body">
                  {data.admission_process}
                </p>
              </div>
              <SourceNote data={data} />
            </section>
          )}

          {/* Cutoffs */}
          {data.cutoffs.length > 0 && (
            <section id="cutoffs" aria-labelledby="cutoffs-heading">
              <SectionHeading eyebrow="Previous year closing ranks" id="cutoffs-heading">
                Cutoffs
              </SectionHeading>
              <div className="mt-4 overflow-x-auto rounded-md border border-hairline">
                <table className="w-full text-sm">
                  <thead className="bg-hairline-soft">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Course</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Exam</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Year</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Category</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Opening rank</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-mute">Closing rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline bg-canvas-elevated">
                    {data.cutoffs.map((c, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-ink">{c.course_name}</td>
                        <td className="px-4 py-3 text-body">{c.exam_name ?? "—"}</td>
                        <td className="px-4 py-3 text-body">{c.year}</td>
                        <td className="px-4 py-3 text-body">{c.category ?? "General"}</td>
                        <td className="px-4 py-3 text-body">{c.opening_rank ?? "—"}</td>
                        <td className="px-4 py-3 text-body">
                          {c.closing_rank != null ? (
                            <span className="font-medium text-ink">{c.closing_rank}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <SourceNote
                text="Cutoffs are historical closing ranks and vary by year, seat type and category. They do not guarantee this year's admission threshold."
                data={data}
              />
            </section>
          )}

          {/* Facilities */}
          {data.facilities.length > 0 && (
            <section id="facilities" aria-labelledby="facilities-heading">
              <SectionHeading eyebrow="Campus amenities" id="facilities-heading">
                Facilities
              </SectionHeading>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.facilities.map((f) => (
                  <span
                    key={f.name}
                    className="inline-flex items-center gap-1.5 rounded-pill-category border border-hairline bg-canvas-elevated px-3.5 py-1.5 text-[13px] text-ink"
                  >
                    <Building2 className="h-3.5 w-3.5 text-mute" aria-hidden /> {f.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section id="reviews" aria-labelledby="reviews-heading">
            <SectionHeading eyebrow="Student feedback" id="reviews-heading">
              Reviews
            </SectionHeading>
            {reviewCount === 0 ? (
              <p className="mt-4 rounded-md border border-hairline bg-canvas-elevated p-5 text-[14px] text-body">
                No verified reviews yet for this college. Share your experience to help other students.
              </p>
            ) : (
              <>
                {data.rating != null ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-hairline bg-canvas-elevated px-4 py-2.5">
                    <Star className="h-5 w-5 fill-ink text-ink" aria-hidden />
                    <span className="font-geist-sans text-[20px] font-semibold text-ink">
                      {data.rating.toFixed(1)}
                    </span>
                    <span className="text-[13px] text-mute">from {reviewCount} approved {reviewCount === 1 ? "review" : "reviews"}</span>
                  </div>
                ) : null}
                <div className="mt-4 space-y-4">
                  {data.reviews.map((r) => (
                    <article
                      key={r.id}
                      className="rounded-md border border-hairline bg-canvas-elevated p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-0.5"
                          role="img"
                          aria-label={`Rated ${r.rating} out of 5`}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < r.rating ? "fill-ink text-ink" : "text-hairline"}`}
                              aria-hidden
                            />
                          ))}
                        </div>
                        <span className="text-[12px] text-mute">
                          {new Date(r.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {r.title ? (
                        <h3 className="mt-2 text-[15px] font-semibold text-ink">{r.title}</h3>
                      ) : null}
                      {r.content ? (
                        <p className="mt-1 text-[14px] leading-5 text-body">{r.content}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Gallery */}
          {data.gallery.length > 0 && (
            <section id="gallery" aria-labelledby="gallery-heading">
              <SectionHeading eyebrow="Photos" id="gallery-heading">
                Gallery
              </SectionHeading>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.gallery.map((g, i) => (
                  <a
                    key={i}
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block aspect-[4/3] overflow-hidden rounded-md border border-hairline bg-canvas-elevated"
                  >
                    <img
                      src={g.url}
                      alt={g.alt_text ?? `${data.name} photo ${i + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {data.faqs.length > 0 && (
            <section id="faqs" aria-labelledby="faqs-heading">
              <SectionHeading eyebrow="Common questions" id="faqs-heading">
                FAQs
              </SectionHeading>
              <div className="mt-4 space-y-3">
                {data.faqs.map((f, i) => (
                  <details key={i} className="group rounded-md border border-hairline bg-canvas-elevated p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-ink">
                      {f.question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-mute transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <p className="mt-2 text-[14px] leading-5 text-body">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Location map */}
          <section id="map" aria-labelledby="map-heading">
            <SectionHeading eyebrow="Location" id="map-heading">
              Map
            </SectionHeading>
            <div className="mt-4 overflow-hidden rounded-md border border-hairline">
              {data.latitude != null && data.longitude != null ? (
                <iframe
                  title={`Map of ${data.name}`}
                  className="h-56 w-full"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=14&output=embed`}
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center bg-hairline-soft px-4 text-center text-[13px] text-mute">
                  Map unavailable for this college
                </div>
              )}
              {data.google_maps_url ? (
                <a
                  href={data.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 border-t border-hairline px-4 py-2.5 text-[13px] font-medium text-link hover:text-link-deep"
                >
                  Get directions <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          </section>

          {/* Admission assistance CTA */}
          <div className="rounded-md border border-hairline bg-canvas-elevated p-6 text-center">
            <p className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
              Free counselling
            </p>
            <h3 className="mt-2 font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">
              Need admission help?
            </h3>
            <p className="mt-2 text-[14px] leading-5 text-body">
              Our counsellors help you check eligibility, documents and next steps for {data.name} — free.
            </p>
            <Button variant="primary" className="mt-4 w-full" asChild>
              <a href="#admission-assistance">Get Admission Assistance</a>
            </Button>
            <p className="mt-3 text-[12px] leading-4 text-mute">
              Guidance only — admission is granted by the institution, not by us.
            </p>
          </div>
        </aside>
      </div>

      {/* Admission Assistance */}
      <section
        id="admission-assistance"
        aria-labelledby="admission-assistance-heading"
        className="mt-12 scroll-mt-20 border-t border-hairline pt-12"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
              Admission assistance
            </p>
            <h2
              id="admission-assistance-heading"
              className="mt-2 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink"
            >
              Get help applying to {data.name}
            </h2>
            <p className="mt-3 text-[16px] leading-6 text-body">
              A Padhaanewala counsellor will guide you on eligibility, documents, deadlines and
              the application steps for your chosen course — free and with no obligation.
            </p>
          </div>
          <div className="mt-8 rounded-lg border border-hairline bg-canvas-elevated p-6 sm:p-8">
            <AdmissionAssistanceForm
              collegeName={data.name}
              collegeState={data.location?.state}
              courses={data.courses.map((c) => c.course_name)}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  id,
  children,
}: {
  eyebrow: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-1 font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink"
      >
        {children}
      </h2>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-hairline bg-canvas-elevated p-4">
      <dt className="text-[12px] font-medium uppercase tracking-wide text-mute">{label}</dt>
      <dd className="mt-1 text-[14px] font-medium text-ink">
        {value ?? <span className="text-mute">Not available in verified database</span>}
      </dd>
    </div>
  )
}

function SourceNote({ data, text }: { data: CollegeDetail; text?: string }) {
  const stamp = data.last_verified_at
    ? `Data verified from ${data.source_name ?? "the source"} on ${new Date(data.last_verified_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`
    : null
  return (
    <p className="mt-2 text-[12px] leading-4 text-mute">
      {text ? `${text} ` : ""}
      {stamp ? stamp : null}
    </p>
  )
}

function AdmissionStatusBadge({ status }: { status?: string | null }) {
  if (!status) return null
  const key = status.toLowerCase()
  const Icon =
    key === "open" ? CheckCircle2 : key === "closed" ? XCircle : key === "tentative" ? CalendarCheck : CircleAlert
  const variant: "success" | "error" | "warning" | "outline" =
    key === "open" ? "success" : key === "closed" ? "error" : key === "tentative" ? "warning" : "outline"
  const label =
    key === "open"
      ? "Admissions open"
      : key === "closed"
        ? "Admissions closed"
        : key === "tentative"
          ? "Admissions tentative"
          : (status.charAt(0).toUpperCase() + status.slice(1))
  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
    </Badge>
  )
}