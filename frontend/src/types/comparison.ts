// Types mirroring backend schemas/comparison.py.

export interface ComparisonCourse {
  course_id: string
  name: string
  level?: string | null
  duration_months?: number | null
  fees?: number | null
  intake?: number | null
}

export interface ComparisonCutoff {
  course_name: string
  exam_name?: string | null
  year: number
  category?: string | null
  opening_rank?: number | null
  closing_rank?: number | null
}

export interface ComparisonReview {
  id: string
  rating: number
  title?: string | null
  content?: string | null
  created_at: string
}

export interface ComparisonCollege {
  id: string
  name: string
  slug: string
  official_name?: string | null
  college_type?: string | null
  is_private: boolean
  accreditation?: string | null
  recognition?: string | null
  established_year?: number | null
  university_name?: string | null
  state?: string | null
  district?: string | null
  city?: string | null
  pincode?: string | null
  address?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  entrance_exam?: string | null
  admission_status?: string | null
  has_hostel: boolean
  rating?: number | null
  courses: ComparisonCourse[]
  cutoffs: ComparisonCutoff[]
  facilities: string[]
  reviews: ComparisonReview[]
  eligibility?: string | null
  admission_process?: string | null
  verification_status?: string | null
  source_name?: string | null
  last_verified_at?: string | null
}

export interface ComparisonResponse {
  colleges: ComparisonCollege[]
  course_id?: string | null
  disclaimer: string
}

export interface ComparisonPreferences {
  course?: string
  budget?: number
  requires_hostel?: boolean
  prefers_govt?: boolean
  state?: string
  city?: string
}

export type AiTier = "HIGHLY_SUITABLE" | "POSSIBLE" | "REACH"

export interface AiCollegeAnalysis {
  college_id: string
  name: string
  slug: string
  tier: AiTier
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  sources: string[]
}

export interface AiCompareResponse {
  colleges: AiCollegeAnalysis[]
  overall_summary: string
  disclaimer: string
}