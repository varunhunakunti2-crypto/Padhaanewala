import { api, buildQuery, type FetchCacheConfig } from "@/lib/api"
import type {
  College,
  CollegeDetail,
  CollegeFacets,
  CollegeListParams,
  Envelope,
  PaginatedItems,
  SearchSuggestions,
} from "@/types/college"

// Public college API (uses friend's generic client in lib/api.ts).
export const collegesPublicApi = {
  list: (params?: CollegeListParams) =>
    api.get<Envelope<PaginatedItems<College>>>(`/colleges${buildQuery(params ?? {})}`),
  facets: (params?: CollegeListParams) =>
    api.get<Envelope<CollegeFacets>>(`/colleges/facets${buildQuery(params ?? {})}`),
  suggestions: (q: string, limit?: number) =>
    api.get<Envelope<SearchSuggestions>>(
      `/search/suggestions${buildQuery({ q, limit: limit ?? 5 })}`
    ),
  getBySlug: (slug: string) =>
    api.get<Envelope<College>>(`/colleges/by-slug/${slug}`),
  detail: (slug: string, config?: FetchCacheConfig) =>
    api.get<Envelope<CollegeDetail>>(`/colleges/detail/${slug}`, undefined, config),
}

// Admin college API — RBAC-protected on the backend.
export const adminCollegesApi = {
  list: (params?: CollegeListParams) =>
    api.get<Envelope<PaginatedItems<College>>>(`/admin/colleges${buildQuery(params ?? {})}`),
  create: (body: Partial<College>) =>
    api.post<Envelope<College>>("/admin/colleges", body),
  get: (id: string) =>
    api.get<Envelope<College>>(`/admin/colleges/${id}`),
  update: (id: string, body: Partial<College>) =>
    api.put<Envelope<College>>(`/admin/colleges/${id}`, body),
  publish: (id: string, is_published: boolean) =>
    api.patch<Envelope<College>>(`/admin/colleges/${id}/publish`, { is_published }),
  verify: (
    id: string,
    body: { verification_status: string; last_verified_at?: string },
  ) => api.patch<Envelope<College>>(`/admin/colleges/${id}/verify`, body),
  archive: (id: string) => api.delete<Envelope<College>>(`/admin/colleges/${id}`),
  bulkArchive: (ids: string[]) =>
    api.post<Envelope<{ archived: number }>>("/admin/colleges/bulk/archive", ids),
  bulkPublish: (ids: string[], is_published: boolean) =>
    api.post<Envelope<{ updated: number }>>("/admin/colleges/bulk/publish", {
      ids,
      is_published,
    }),
  bulkVerify: (
    ids: string[],
    body: { verification_status: string; last_verified_at?: string },
  ) => api.post<Envelope<{ updated: number }>>("/admin/colleges/bulk/verify", {
    ids,
    ...body,
  }),
}