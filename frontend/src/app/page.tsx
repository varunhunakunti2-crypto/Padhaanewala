import type { Metadata } from "next";

import { api } from "@/lib/api";
import type { HomepageResponse } from "@/types/homepage";

import { HeroSection } from "@/components/home/hero-section";
import { QuickActions } from "@/components/home/quick-actions";
import { PopularCourses } from "@/components/home/popular-courses";
import { FeaturedColleges } from "@/components/home/featured-colleges";
import { PopularSearches } from "@/components/home/popular-searches";
import { Scholarships } from "@/components/home/scholarships";
import { UpcomingExams } from "@/components/home/upcoming-exams";
import { MockTests } from "@/components/home/mock-tests";
import { WhyUs } from "@/components/home/why-us";
import { Reviews } from "@/components/home/reviews";
import { Articles } from "@/components/home/articles";
import { AdmissionCTA } from "@/components/home/admission-cta";
import { HomepageError } from "@/components/home/homepage-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Padhaanewala — Find the Right College for Your Future",
  description:
    "Search verified colleges, courses, scholarships, exams and mock tests across India. Compare colleges, check cutoffs and get free admission assistance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Padhaanewala — Find the Right College for Your Future",
    description:
      "Search verified colleges, courses, scholarships, exams and mock tests across India.",
    type: "website",
    siteName: "Padhaanewala",
  },
};

const fallback: HomepageResponse = {
  hero: {
    heading: "Find the Right College for Your Future",
    subtitle:
      "Search verified colleges, courses, scholarships and exams across India.",
    search_placeholder: "Search colleges, courses, exams or locations",
    search_button_label: "Search",
    predictor_button_label: "AI College Predictor",
  },
  quick_actions: [],
  popular_courses: [],
  featured_colleges: [],
  popular_searches: [],
  scholarships: [],
  upcoming_exams: [],
  mock_tests: [],
  why_us: [],
  reviews: [],
  articles: [],
  cta: {
    title: "",
    subtitle: "",
    button_label: "Get Admission Assistance",
    button_href: "/contact",
  },
};

export default async function Home() {
  let data: HomepageResponse | null = null;
  try {
    // Backend returns { success, message, data } — unwrap the data field.
    const res = await api.get<{ success: boolean; data: HomepageResponse }>("/cms/homepage");
    data = res.data;
  } catch (err) {
    console.error("[homepage] failed to load:", err);
    return <HomepageError />;
  }

  // Never show a broken page: if the API responds but drops a section, fall
  // back to defaults instead of rendering undefined.
  const h = { ...fallback, ...(data ?? {}), hero: { ...fallback.hero, ...(data?.hero ?? {}) }, cta: { ...fallback.cta, ...(data?.cta ?? {}) } };

  return (
    <div className="flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://padhaanewala.in/#organization",
                name: "Padhaanewala",
                url: "https://padhaanewala.in",
              },
              {
                "@type": "WebSite",
                "@id": "https://padhaanewala.in/#website",
                url: "https://padhaanewala.in",
                name: "Padhaanewala",
                description:
                  "Search verified colleges, courses, scholarships, exams and mock tests across India.",
                publisher: { "@id": "https://padhaanewala.in/#organization" },
              },
            ],
          }),
        }}
      />
      <HeroSection hero={h.hero} />
      <QuickActions items={h.quick_actions} />
      <PopularCourses courses={h.popular_courses} />
      <FeaturedColleges colleges={h.featured_colleges} />
      <PopularSearches searches={h.popular_searches} />
      <Scholarships scholarships={h.scholarships} />
      <UpcomingExams exams={h.upcoming_exams} />
      <MockTests tests={h.mock_tests} />
      <WhyUs items={h.why_us} />
      <Reviews reviews={h.reviews} />
      <Articles articles={h.articles} />
      <AdmissionCTA cta={h.cta} />
    </div>
  );
}