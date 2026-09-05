/**
 * Padhaanewala API Client
 *
 * All API calls go through this module. It reads NEXT_PUBLIC_API_URL from env,
 * handles error normalization, and provides typed fetch wrappers.
 * No secrets or keys live here — those are backend-only.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

// ─── Error Types ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public detail?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// ─── Core Fetcher ─────────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  token?: string
  next?: { revalidate?: number | false; tags?: string[] }
}

/**
 * Server-side cache hints passed to the underlying fetch so Server
 * Components can opt into ISR (revalidate) / on-demand revalidation (tags)
 * without turning on caching for every call site.
 */
export interface FetchCacheConfig {
  revalidate?: number | false
  tags?: string[]
  cache?: RequestCache
}

async function fetcher<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...init } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    let body: Record<string, unknown> = {}
    try {
      body = await res.json()
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      res.status,
      (body.code as string) ?? "API_ERROR",
      (body.message as string) ?? `HTTP ${res.status}`,
      body.detail
    )
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ─── Typed Helpers ────────────────────────────────────────────────────────────

export const api = {
  get<T>(
    path: string,
    token?: string,
    config?: FetchCacheConfig
  ): Promise<T> {
    return fetcher<T>(path, {
      method: "GET",
      token,
      cache: config?.cache,
      next:
        config?.revalidate !== undefined || config?.tags
          ? { revalidate: config.revalidate, tags: config.tags }
          : undefined,
    })
  },

  post<T>(path: string, body: unknown, token?: string): Promise<T> {
    return fetcher<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    })
  },

  put<T>(path: string, body: unknown, token?: string): Promise<T> {
    return fetcher<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    })
  },

  patch<T>(path: string, body: unknown, token?: string): Promise<T> {
    return fetcher<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    })
  },

  delete<T>(path: string, token?: string): Promise<T> {
    return fetcher<T>(path, { method: "DELETE", token })
  },
}

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    size: number
    total: number
    pages: number
  }
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") {
      qs.set(key, String(val))
    }
  }
  const str = qs.toString()
  return str ? `?${str}` : ""
}

// ─── Domain Endpoints ─────────────────────────────────────────────────────────

// Colleges
export const collegesApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<PaginatedResponse<unknown>>(`/colleges${buildQuery(params ?? {})}`),
  get: (slug: string) => api.get<unknown>(`/colleges/${slug}`),
}

// Courses
export const coursesApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<PaginatedResponse<unknown>>(`/courses${buildQuery(params ?? {})}`),
  get: (slug: string) => api.get<unknown>(`/courses/${slug}`),
}

// Scholarships
export const scholarshipsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<PaginatedResponse<unknown>>(`/scholarships${buildQuery(params ?? {})}`),
  get: (slug: string) => api.get<unknown>(`/scholarships/${slug}`),
}

// Exams
export const examsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<PaginatedResponse<unknown>>(`/exams${buildQuery(params ?? {})}`),
  get: (slug: string) => api.get<unknown>(`/exams/${slug}`),
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string }>("/auth/login", { email, password }),
  register: (body: { name: string; email: string; password: string; mobile?: string }) =>
    api.post<{ access_token: string; refresh_token: string }>("/auth/register", body),
  refresh: (refreshToken: string) =>
    api.post<{ access_token: string }>("/auth/refresh", { refresh_token: refreshToken }),
  logout: (token: string) => api.post<void>("/auth/logout", {}, token),
}

// Enquiries
export const enquiriesApi = {
  submit: (body: {
    name: string
    mobile: string
    email?: string
    course?: string
    preferred_college?: string
    state?: string
    message?: string
    source?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }) => api.post<{ message: string }>("/enquiries", body),
}

// Search
export const searchApi = {
  suggestions: (q: string) =>
    api.get<{ colleges: unknown[]; courses: unknown[]; exams: unknown[]; locations: unknown[] }>(
      `/search/suggestions?q=${encodeURIComponent(q)}`
    ),
  natural: (q: string) =>
    api.get<{ interpreted_filters: unknown; results: unknown[] }>(
      `/search/natural?q=${encodeURIComponent(q)}`
    ),
}

// AI
export const aiApi = {
  ask: (body: { query: string; conversation_id?: string }, token?: string) =>
    api.post<{ answer: string; sources: unknown[]; disclaimer: string }>(
      "/ai/assistant",
      body,
      token
    ),
}

// Predictor
export const predictorApi = {
  predict: (body: {
    course: string
    exam?: string
    rank?: number
    category?: string
    state?: string
    budget?: number
    prefers_govt?: boolean
    requires_hostel?: boolean
  }) => api.post<{ results: unknown[]; disclaimer: string }>("/predictor", body),
}
