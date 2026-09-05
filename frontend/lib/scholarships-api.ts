import { api, buildQuery, type FetchCacheConfig } from "@/lib/api"
import type {
  Scholarship,
  ScholarshipDetail,
  ScholarshipFacets,
  ScholarshipListParams,
} from "@/types/scholarship"
import type { Envelope, PaginatedItems } from "@/types/college"

export const scholarshipsPublicApi = {
  list: (params?: ScholarshipListParams) =>
    api.get<Envelope<PaginatedItems<Scholarship>>>(`/scholarships${buildQuery(params ?? {})}`),
  facets: () => api.get<Envelope<ScholarshipFacets>>("/scholarships/facets"),
  getBySlug: (slug: string, config?: FetchCacheConfig) =>
    api.get<Envelope<ScholarshipDetail>>(`/scholarships/by-slug/${slug}`, undefined, config),
}

export const adminScholarshipsApi = {
  list: (params?: ScholarshipListParams) =>
    api.get<Envelope<PaginatedItems<Scholarship>>>(`/admin/scholarships${buildQuery(params ?? {})}`),
  create: (body: Record<string, unknown>) =>
    api.post<Envelope<Scholarship>>("/admin/scholarships", body),
  get: (id: string) => api.get<Envelope<ScholarshipDetail>>(`/admin/scholarships/${id}`),
  update: (id: string, body: Record<string, unknown>) =>
    api.put<Envelope<Scholarship>>(`/admin/scholarships/${id}`, body),
  remove: (id: string) => api.delete<Envelope<Scholarship>>(`/admin/scholarships/${id}`),
  setStatus: (id: string, status: string) =>
    api.patch<Envelope<Scholarship>>(`/admin/scholarships/${id}/status?status=${status}`, {}),
}