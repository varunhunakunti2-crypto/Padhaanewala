// College types mirroring backend schemas/college.py + repository filters.

export interface College {
  id: string
  name: string
  college_code: string
  slug: string
  official_name?: string | null
  college_type?: string | null
  is_private: boolean
  accreditation?: string | null
  recognition?: string | null
  established_year?: number | null
  university_id?: string | null
  university_name?: string | null
  location_id?: string | null
  location?: {
    state?: string | null
    district?: string | null
    city?: string | null
    pincode?: string | null
  } | null
  state?: string | null
  district?: string | null
  city?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  pincode?: string | null
  entrance_exam?: string | null
  admission_status?: string | null
  has_hostel: boolean
  latitude?: number | null
  longitude?: number | null
  google_maps_url?: string | null
  google_place_id?: string | null
  is_published: boolean
  rating?: number | null
  course_names?: string[] | null
  min_fee?: number | null
  source_url?: string | null
  source_name?: string | null
  verification_status?: string | null
  last_verified_at?: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedItems<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface Envelope<T> {
  success: boolean
  message?: string
  data: T
}

export type CollegeSortValue = "relevance" | "name" | "rating" | "fees_asc" | "fees_desc"

export type CollegeListParams = {
  page?: number
  size?: number
  search?: string
  sort?: CollegeSortValue
  course?: string
  state?: string
  district?: string
  city?: string
  college_type?: string
  is_private?: boolean
  university?: string
  min_fee?: number
  max_fee?: number
  has_hostel?: boolean
  rating?: number
  accreditation?: string
  admission_status?: string
  verification_status?: string
  is_published?: boolean
}

export interface CollegeCourseDetail {
  course_id: string
  course_name: string
  level?: string | null
  fees?: number | null
  duration_months?: number | null
  intake?: number | null
}

export interface CollegeFacilityDetail {
  name: string
}

export interface CollegeReviewDetail {
  id: string
  rating: number
  title?: string | null
  content?: string | null
  created_at: string
}

export interface CollegeFaqDetail {
  question: string
  answer: string
}

export interface CollegeCutoffDetail {
  course_name: string
  exam_name?: string | null
  year: number
  category?: string | null
  opening_rank?: number | null
  closing_rank?: number | null
}

export interface CollegeMediaDetail {
  url: string
  alt_text?: string | null
  image_type?: string | null
}

export interface CollegeDetail extends College {
  university_name?: string | null
  location?: { state?: string | null; district?: string | null; city?: string | null; pincode?: string | null } | null
  courses: CollegeCourseDetail[]
  facilities: CollegeFacilityDetail[]
  reviews: CollegeReviewDetail[]
  faqs: CollegeFaqDetail[]
  cutoffs: CollegeCutoffDetail[]
  gallery: CollegeMediaDetail[]
  eligibility?: string | null
  admission_process?: string | null
}

// ---- Phase 08: facets + suggestions ----

export interface FacetBucket {
  label: string
  count: number
}

export interface CollegeFacets {
  total: number
  states: FacetBucket[]
  districts: FacetBucket[]
  cities: FacetBucket[]
  college_types: FacetBucket[]
  courses: FacetBucket[]
  universities: FacetBucket[]
  accreditation: FacetBucket[]
  admission_statuses: FacetBucket[]
}

export type SuggestionType = "college" | "course" | "exam" | "state" | "district" | "city"

export interface SuggestionItem {
  type: SuggestionType
  label: string
  value: string
  sublabel?: string | null
}

export interface SearchSuggestions {
  query: string
  colleges: SuggestionItem[]
  courses: SuggestionItem[]
  exams: SuggestionItem[]
  locations: SuggestionItem[]
}