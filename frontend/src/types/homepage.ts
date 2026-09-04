// Type definitions mirroring the backend HomepageResponse schema
// (backend/app/schemas/homepage.py). Keep in sync when the API changes.

export interface HeroContent {
  heading: string;
  subtitle: string;
  search_placeholder: string;
  search_button_label: string;
  predictor_button_label: string;
}

export interface QuickActionItem {
  label: string;
  href: string;
  description?: string | null;
  icon?: string | null;
}

export interface PopularCourseItem {
  id: string;
  name: string;
  level?: string | null;
  colleges_count: number;
}

export interface FeaturedCollegeItem {
  id: string;
  name: string;
  college_code: string;
  state?: string | null;
  city?: string | null;
}

export interface PopularSearchItem {
  label: string;
  query: string;
  href?: string | null;
}

export interface ScholarshipSummary {
  id: string;
  name: string;
  provider_name: string;
  amount?: number | null;
}

export interface UpcomingExamItem {
  id: string;
  name: string;
  event_name: string;
  event_date?: string | null;
}

export interface MockTestItem {
  id: string;
  title: string;
  description?: string | null;
  duration_minutes?: number | null;
}

export interface WhyUsItem {
  title: string;
  description: string;
  icon?: string | null;
}

export interface ReviewItem {
  id: string;
  college_name: string;
  rating: number;
  title?: string | null;
  content?: string | null;
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
}

export interface CTAContent {
  title: string;
  subtitle: string;
  button_label: string;
  button_href: string;
}

export interface HomepageResponse {
  hero: HeroContent;
  quick_actions: QuickActionItem[];
  popular_courses: PopularCourseItem[];
  featured_colleges: FeaturedCollegeItem[];
  popular_searches: PopularSearchItem[];
  scholarships: ScholarshipSummary[];
  upcoming_exams: UpcomingExamItem[];
  mock_tests: MockTestItem[];
  why_us: WhyUsItem[];
  reviews: ReviewItem[];
  articles: ArticleItem[];
  cta: CTAContent;
}