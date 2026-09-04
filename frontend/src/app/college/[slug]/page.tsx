import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  MapPin,
  Star,
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  ChevronRight,
  ExternalLink,
  BedDouble,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { collegesPublicApi } from "@/lib/colleges-api"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const { data } = await collegesPublicApi.detail(slug)
    return {
      title: `${data.name} — Admissions, Fees, Cutoff, Courses | Padhaanewala`,
      description: `Explore ${data.name} — courses, fees, eligibility, admission process, cutoffs and reviews. ${data.college_type ?? ""} college in ${data.location?.city ?? ""} ${data.location?.state ?? ""}.`,
      alternates: { canonical: `/college/${data.slug}` },
      openGraph: {
        title: `${data.name} | Padhaanewala`,
        description: `Courses, fees, eligibility and admission details for ${data.name}.`,
        type: "website",
      },
    }
  } catch {
    return { title: "College | Padhaanewala" }
  }
}

export default async function CollegeDetailPage({ params }: PageProps) {
  const { slug } = await params
  let data
  try {
    ;({ data } = await collegesPublicApi.detail(slug))
  } catch {
    notFound()
  }

  const loc = data.location
  const locStr = [loc?.city, loc?.district, loc?.state].filter(Boolean).join(", ")

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "EducationalOrganization", name: data.name, url: `https://padhaanewala.in/college/${data.slug}`, email: data.email, telephone: data.phone, address: { "@type": "PostalAddress", streetAddress: data.address, postalCode: data.pincode, addressLocality: loc?.city, addressRegion: loc?.state } }) }} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[13px] text-body">
        <Link href="/" className="hover:text-link">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-mute" aria-hidden />
        <Link href="/colleges" className="hover:text-link">Colleges</Link>
        {loc?.state && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-mute" aria-hidden />
            <span>{loc.state}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{data.college_type ? `${data.college_type} college` : "College"}</Badge>
              <Badge variant="outline">{data.is_private ? "Private" : "Government"}</Badge>
              {data.rating ? (
                <Badge variant="outline" className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-ink text-ink" aria-hidden /> {data.rating.toFixed(1)}
                  {data.reviews.length ? ` (${data.reviews.length})` : ""}
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-3 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink sm:text-[40px] sm:leading-[44px]">
              {data.name}
            </h1>
            {data.official_name && data.official_name !== data.name ? (
              <p className="mt-1 text-[14px] text-body">Official name: {data.official_name}</p>
            ) : null}
            {locStr ? (
              <p className="mt-2 flex items-center gap-1.5 text-[15px] text-body">
                <MapPin className="h-4 w-4 text-mute" aria-hidden /> {locStr}
                {data.pincode ? ` - ${data.pincode}` : ""}
              </p>
            ) : null}
            {data.verification_status === "verified" ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-emerald-700">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Verified source: {data.source_name ?? "official"} {data.last_verified_at ? `· ${new Date(data.last_verified_at).toLocaleDateString()}` : ""}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" asChild>
              <Link href="/contact">Get Admission Help</Link>
            </Button>
            <Button variant="ghost-sm" asChild>
              <Link href="/compare">Compare</Link>
            </Button>
          </div>
        </div>
        {/* Contact strip */}
        {(data.website || data.email || data.phone) && (
          <div className="mt-6 flex flex-wrap gap-4 rounded-md border border-hairline bg-canvas-elevated p-4 text-[14px] text-body">
            {data.website && (
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-link">
                <Globe className="h-4 w-4 text-mute" aria-hidden /> Website <ExternalLink className="h-3 w-3" aria-hidden />
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

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-12 lg:col-span-2">
          {/* Overview */}
          <section>
            <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">Overview</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow label="Established" value={data.established_year ? String(data.established_year) : undefined} />
              <InfoRow label="Accreditation" value={data.accreditation} />
              <InfoRow label="Recognition" value={data.recognition} />
              <InfoRow label="University" value={data.university_name} />
              <InfoRow label="Entrance exam" value={data.entrance_exam} />
              <InfoRow label="Admission status" value={data.admission_status} />
            </dl>
          </section>

          {/* Courses & fees */}
          {data.courses.length > 0 && (
            <section>
              <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">Courses & Fees</h2>
              <div className="mt-4 overflow-x-auto rounded-md border border-hairline">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-hairline-soft)]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Course</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Level</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Duration</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline bg-canvas-elevated">
                    {data.courses.map((c) => (
                      <tr key={c.course_id}>
                        <td className="px-4 py-3 font-medium text-ink">{c.course_name}</td>
                        <td className="px-4 py-3 text-body">{c.level ?? "—"}</td>
                        <td className="px-4 py-3 text-body">{c.duration_months ? `${c.duration_months} months` : "—"}</td>
                        <td className="px-4 py-3 text-body">{c.fees != null ? `₹${c.fees.toLocaleString("en-IN")}` : "Approximate"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[12px] text-mute">Approximate fees — verify with the institution before admission.</p>
            </section>
          )}

          {/* Eligibility + Admission */}
          {(data.eligibility || data.admission_process) && (
            <section>
              <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">Admission</h2>
              {data.eligibility && (
                <div className="mt-4">
                  <h3 className="text-[14px] font-semibold text-ink">Eligibility</h3>
                  <p className="mt-1 text-[14px] leading-5 text-body">{data.eligibility}</p>
                </div>
              )}
              {data.admission_process && (
                <div className="mt-4">
                  <h3 className="text-[14px] font-semibold text-ink">Admission process</h3>
                  <p className="mt-1 text-[14px] leading-5 text-body">{data.admission_process}</p>
                </div>
              )}
            </section>
          )}

          {/* Cutoffs */}
          {data.cutoffs.length > 0 && (
            <section>
              <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">Cutoffs</h2>
              <div className="mt-4 overflow-x-auto rounded-md border border-hairline">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-hairline-soft)]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Course</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Exam</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Year</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--color-mute)]">Closing rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline bg-canvas-elevated">
                    {data.cutoffs.map((c, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">{c.course_name}</td>
                        <td className="px-4 py-3 text-body">{c.exam_name ?? "—"}</td>
                        <td className="px-4 py-3 text-body">{c.year}</td>
                        <td className="px-4 py-3 text-body">{c.category ?? "—"}</td>
                        <td className="px-4 py-3 text-body">{c.closing_rank ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Gallery */}
          {data.gallery.length > 0 && (
            <section>
              <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.gallery.map((g, i) => (
                  <a
                    key={i}
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-md border border-hairline bg-canvas-elevated"
                  >
                    <img
                      src={g.url}
                      alt={g.alt_text ?? `${data.name} photo ${i + 1}`}
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Facilities */}
          {data.facilities.length > 0 && (
            <section>
              <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">Facilities</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.facilities.map((f) => (
                  <span key={f.name} className="inline-flex items-center gap-1.5 rounded-pill-category border border-hairline bg-canvas-elevated px-3.5 py-1.5 text-[13px] text-ink">
                    <Building2 className="h-3.5 w-3.5 text-mute" aria-hidden /> {f.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">Reviews</h2>
            {data.reviews.length === 0 ? (
              <p className="mt-4 text-[14px] text-body">No reviews yet — be the first to review this college.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {data.reviews.map((r) => (
                  <div key={r.id} className="rounded-md border border-hairline bg-canvas-elevated p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5" role="img" aria-label={`${r.rating} out of 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-ink text-ink" : "text-hairline"}`} aria-hidden />
                        ))}
                      </div>
                      <span className="text-[12px] text-mute">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.title ? <h3 className="mt-2 text-[15px] font-semibold text-ink">{r.title}</h3> : null}
                    {r.content ? <p className="mt-1 text-[14px] leading-5 text-body">{r.content}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* FAQs */}
          {data.faqs.length > 0 && (
            <section>
              <h2 className="font-geist-sans text-[20px] font-semibold tracking-[-0.4px] text-ink">FAQs</h2>
              <div className="mt-4 space-y-3">
                {data.faqs.map((f, i) => (
                  <details key={i} className="group rounded-md border border-hairline bg-canvas-elevated p-4">
                    <summary className="cursor-pointer list-none text-[14px] font-medium text-ink">{f.question}</summary>
                    <p className="mt-2 text-[14px] leading-5 text-body">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Map */}
          {data.latitude != null && data.longitude != null ? (
            <div className="overflow-hidden rounded-md border border-hairline">
              <iframe
                title={`Map of ${data.name}`}
                className="h-56 w-full"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=14&output=embed`}
              />
              {data.google_maps_url && (
                <a href={data.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 border-t border-hairline px-4 py-2.5 text-[13px] font-medium text-link hover:text-link-deep">
                  Get directions <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
            </div>
          ) : data.google_maps_url ? (
            <a href={data.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-md border border-hairline bg-canvas-elevated px-4 py-3 text-[13px] font-medium text-link">
              View on Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}

          {/* Admission CTA */}
          <div className="rounded-md border border-hairline bg-canvas-elevated p-6 text-center">
            <h3 className="font-geist-sans text-[18px] font-semibold text-ink">Need admission help?</h3>
            <p className="mt-2 text-[14px] leading-5 text-body">
              Our counsellors guide you through eligibility, documents and the application process — free.
            </p>
            <Button variant="primary" className="mt-4 w-full" asChild>
              <Link href={`/contact?college=${encodeURIComponent(data.name)}`}>Get Admission Assistance</Link>
            </Button>
            <p className="mt-3 text-[12px] text-mute">Information on this page is for guidance. Please verify with the institution before applying.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-hairline bg-canvas-elevated p-4">
      <dt className="text-[12px] font-medium uppercase tracking-wide text-mute">{label}</dt>
      <dd className="mt-1 text-[14px] font-medium text-ink">{value ?? "Not available in verified database"}</dd>
    </div>
  )
}