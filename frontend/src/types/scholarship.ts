// Types mirroring backend schemas/scholarship.py.

export interface Scholarship {
  id: string
  name: string
  slug?: string | null
  description?: string | null
  provider_name: string
  is_government: boolean
  amount?: number | null
  eligibility_criteria?: string | null
  income_criteria?: string | null
  deadline?: string | null
  documents?: string | null
  application_procedure?: string | null
  official_application_url?: string | null
  status: "active" | "expired" | "draft"
  states: string[]
  course_names: string[]
  source_name?: string | null
  source_url?: string | null
  verification_status?: string | null
  last_verified_at?: string | null
  created_at: string
  updated_at: string
}

export interface ScholarshipDetail extends Scholarship {
  course_ids: string[]
}

export interface ScholarshipFacets {
  total: number
  states: { label: string; count: number }[]
  courses: { label: string; count: number }[]
  statuses: { label: string; count: number }[]
}

export type ScholarshipListParams = {
  page?: number
  size?: number
  search?: string
  course?: string
  state?: string
  govt?: boolean
  status?: string
  upcoming?: boolean
  min_amount?: number
}

export interface ScholarshipCreateInput {
  name: string
  description?: string
  provider_name: string
  is_government?: boolean
  amount?: number
  eligibility_criteria?: string
  income_criteria?: string
  deadline?: string
  documents?: string
  application_procedure?: string
  official_application_url?: string
  status?: string
  states?: string[]
  course_ids?: string[]
}