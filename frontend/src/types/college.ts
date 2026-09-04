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
  location_id?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  admission_status?: string | null
  has_hostel: boolean
  latitude?: number | null
  longitude?: number | null
  google_maps_url?: string | null
  google_place_id?: string | null
  is_published: boolean
  rating?: number | null
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

export type CollegeListParams = {
  page?: number
  size?: number
  search?: string
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
  is_published?: boolean
}