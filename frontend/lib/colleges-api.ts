import { api, buildQuery } from "@/lib/api"
import type {
  College,
  CollegeDetail,
  CollegeListParams,
  Envelope,
  PaginatedItems,
} from "@/types/college"

// Public college API (uses friend's generic client in lib/api.ts).
export const collegesPublicApi = {
  list: (params?: CollegeListParams) =>
    api.get<Envelope<PaginatedItems<College>>>(`/colleges${buildQuery(params ?? {})}`),
  getBySlug: (slug: string) =>
    api.get<Envelope<College>>(`/colleges/by-slug/${slug}`),
  detail: (slug: string) =>
    api.get<Envelope<CollegeDetail>>(`/colleges/detail/${slug}`),
}

// Admin college API — RBAC-protected on the backend.
export const adminCollegesApi = {
  list: (params?: CollegeListParams & { is_published?: boolean }) =>
    api.get<Envelope<PaginatedItems<College>>>(
      `/colleges${buildQuery({ ...params, is_published: undefined })}`,
    ),
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
}