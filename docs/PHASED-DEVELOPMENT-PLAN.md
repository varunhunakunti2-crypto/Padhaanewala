# Padhaanewala — Deep-Dive Phased Development Plan
Version 1.0 | Source of truth: Padhaanewala Master Website Development Specification v2.0
Working copy of the 47-prompt September order, expanded into mini-phases and task-level (micro) phases.

## Legend

- ✅ **DONE** = already implemented in the repo (verified).
- 🔶 **PARTIAL** = partially implemented (skeleton exists, feature incomplete).
- ⬜ **TODO** = not started.
- Each phase ends with a **Definition of Done (DoD)**: the exact checks that prove the phase is complete.
- Rubric: a task is "done" only when it runs, is verified, and (for backend) is covered by a test.

> **Status snapshot (PROMPT 12 session):** **Existing errors cleaned first** — frontend lint is fully clean (0 errors, 0 warnings; fixed unused imports + `<img>`→`next/image` for arbitrary remote hosts via `images.remotePatterns`), backend now genuinely verified (Python 3.12 installed, venv rebuilt, `pip install -r requirements.txt`; `app` imports, all 28 routes register, 15 unit tests pass; `on_event`→lifespan), dead code removed (5 legacy models, `hello.c`, 4 `.astro` drafts), mock auth removed from `app/api/dependencies.py` (now a clean `get_db` re-export), and `database/alembic.ini` created. **Phase 12 — Scholarship System complete**: model + migration `a1b2c3d4e5f6`, public API (`/api/v1/scholarships` list/facets/by-slug) + admin API (CRUD/status/verify), `/scholarships` finder (course/state/govt/upcoming filters) and `/scholarships/[slug]` (dual CTAs — official application vs Padhaanewala counselling, source/verification, metadata + `ScholarshipOrFinancialAid` JSON-LD), admin UI `/admin/scholarships` (list + form). Verified: `tsc --noEmit` clean, `npm run lint` clean, `next build` green. NOTE: migration `a1b2c3d4e5f6` not yet applied — `alembic upgrade head` against a dev PostgreSQL is required before the APIs work.
> **Known merge issues:** (1) stale mock `app/api/dependencies.py` coexists with real `app/api/deps.py` — dead code; (2) 5 stale duplicate model files (`college.py`, `course.py`, `assessment.py`, `ai.py`, `admission.py`) — dead code; (3) `frontend/src/pages/*.astro` auth drafts are NOT runnable in Next.js; (4) `hello.c` stray at root; (5) `alembic.ini` missing (migrations need it).

---

## DAY 1 — Foundation

### PHASE 01 — MASTER PROJECT INITIALIZATION

**Goal:** Verify and harden the monorepo scaffold so every later phase has a stable base.
**Current state:** 🔶 Monorepo exists (`frontend/`, `backend/`, `database/`, `docs/`, `scripts/`) but has contradictions.

**Mini-phase A — Repo hygiene**
- [x] Delete stale duplicate backend models (dead code, must never be imported):
  - `backend/app/models/college.py`
  - `backend/app/models/course.py`
  - `backend/app/models/assessment.py`
  - `backend/app/models/ai.py`
  - `backend/app/models/admission.py`
- [x] Delete stray `hello.c` at repo root.
- [x] Reconcile Astro contradiction: deleted `frontend/src/pages/*.astro` drafts (not runnable in Next.js). — `.vscode/launch.json`, `.vscode/extensions.json`, `skills-lock.json`, root `AGENTS.md` Astro references still need updating to Next.js tooling
- [x] Verify `.gitignore` covers: `backend/.env`, `frontend/.env*`, `database/alembic.ini`, `*.log`, OS junk.
- [ ] Confirm git repo clean on `main`; establish branch convention `develop`, `feature/*`, `bugfix/*`.

**Mini-phase B — Environment configuration**
- [ ] Create `backend/.env` (real) from `.env.example` with local dev values; `.env.example` stays in git.
- [ ] Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` (public-safe only; no secrets).
- [ ] Create separate config docs for Dev / Staging / Prod (staging env vars template in repo).
- [ ] Ensure `AI_API_KEY`, `JWT_SECRET`, `STORAGE_*` exist only in `.env`, never committed.

**Mini-phase C — Alembic runnable**
- [x] Create `database/alembic.ini` (currently gitignored but missing) with `script_location = database/migrations`. — created (gitignored, local only)
- [ ] Verify `alembic upgrade head` runs against a local PostgreSQL DB.
- [ ] Document the DB creation + migration command sequence in `database/README.md`.

**Mini-phase D — Start/check commands**
- [ ] Backend boots: `uvicorn app.main:app --reload` → `/health` responds.
- [ ] Frontend boots: `npm run dev` → homepage renders at `localhost:3000`.
- [ ] Write `scripts/check_env.py` (or equivalent) that pings backend `/health` + frontend `/` and reports OK/FAIL.

**DoD:** Backend and frontend both start; migrations run; git tree clean; no stale models on `sys.path`; `.env` files documented.

---

### PHASE 02 — DATABASE ARCHITECTURE

**Goal:** Keep the schema production-grade. Models + 2 migrations already exist; this phase validates, fixes gaps, and adds verification/constraints gaps flagged below.
**Current state:** ✅ ~40 tables across 6 domains; migrations `7c5e8a2cc78a` + `e8fa603fb463`; pgvector enabled.

**Mini-phase A — Schema audit vs specification**
- [ ] Diff each specification field list (College, Course, Scholarship, Exam, Enquiry, Lead, Question, Test...) against the actual model columns.
- [ ] Produce a field-by-field gap table in `docs/schema-gaps.md`.

**Mini-phase B — Gap fixes (expected)**
- [ ] College: add `slug`, `official_name`, `college_type`, `government/private`, `accreditation`, `recognition`, `estd_year`, `cover_image`, `gallery` via `Media`, `google_maps_url`, `google_place_id`, `lat`, `lng`, `admission_status`, `approved/is_published`.
- [ ] Course: add `slug`, `degree`, `duration_months`, `eligibility`, `entrance_exam`, `admission_procedure`, `career_info`, `description`.
- [ ] Fees: normalize into `fees` table (tuition, hostel, exam, other, total, period) linked to `college_courses`; keep `is_approximate` + disclaimer flag.
- [ ] Cutoff: normalize `admission`, `eligibility` text fields already present — add `exam_id`, `round`, `category` (partially present).
- [ ] Scholarship: add `amount`, `deadline` (date), `documents`, `application_procedure`, `official_application_url`, `provider`, `govt/private`, `income_criteria`, `status`.
- [ ] Exam: add `conducting_authority`, `official_website`, `official_notification_url`; `exam_dates` already normalized.
- [ ] Reviews: add `course` link, `year`, `rating`, `review`, `is_approved` (already has `ReviewModeration`).
- [ ] Lead: add `lead_id` code (e.g. `LEAD000001`), editable `follow_up_date`.
- [ ] Question/Test: verify question type enum, `marks`, `negative_marks`, `source`.
- [ ] Add check constraints (rating 1–5, fee >= 0, year ranges) and unique constraints (slug per entity).

**Mini-phase C — New Alembic migration + seed**
- [ ] Generate one new migration for all gap fixes (`alembic revision --autogenerate`), review, then `upgrade head`.
- [x] Create `database/seeds/` (README promises it, folder missing) with idempotent seed scripts. — `seed_homepage.py` (idempotent upsert)
- [ ] Seed: base roles/permissions, sample Location/State data, facilities list.
- [ ] Keep a clearly-marked demo dataset script (never counts as production data).

**Mini-phase D — Indexes & validation script**
- [ ] Add indexes: colleges.name, colleges.slug, courses.slug, fees(fee values), scholarships(deadline), exam_dates(date), leads(status, assigned_counsellor), reviews(college_id,is_approved).
- [ ] Update/extend `scripts/final_validation.py` to assert every table + key index exists.

**DoD:** `alembic upgrade head` green; schema-gap table shows zero unaddressed spec fields; seed runs twice without error; validation script passes.

---

### PHASE 03 — BACKEND ARCHITECTURE

**Goal:** Modular FastAPI architecture where routes → services → repositories → DB.
**Current state:** 🔶 core config/logging/exceptions/session/pagination; generic BaseRepository/BaseService; routers registered: auth, colleges, cms (homepage). Missing: ~20 other module routers, most schemas, request-id middleware, envelope on error handlers, test-DB isolation.

**Mini-phase A — Response & error standardization**
- [x] Finalize `ResponseModel` / `PaginatedResponse` envelope (success, message, data; PaginatedData items/total/page/size/pages) — `app/schemas/common.py`.
- [ ] Standardize HTTP status usage via constants; ensure all handlers return the envelope (error handlers still return fastapi HTTPException dicts).
- [ ] Add request-id middleware that injects `X-Request-ID` into responses + logs.

**Mini-phase B — Module scaffolding (stubs → real)**
- [ ] Create `app/api/v1/endpoints/` files + routers for: users, courses, universities, locations, facilities, scholarships, exams, mock_tests, reviews, blogs, faqs, banners, notifications, enquiries, leads, counsellors, predictor, ai, search, comparison, media, analytics, dashboard(admin). — verified: only auth/colleges/cms exist
- [ ] Register each router in `app/api/v1/api.py` under `/api/v1/...` namespaces. — only 3 registered so far
- [ ] Create schemas package per module (minimal stub schemas first). — college/homepage/token/user/common exist

**Mini-phase C — Repository/Service layer for priorities**
- [ ] Implement repositories: Course, University, Scholarship, Exam, Enquiry, Review, Blog.
- [ ] Implement services for each of the above (get_or_404, create, update, delete, list+filters).
- [ ] Add generic filtering/sorting helper in `app/utils/` (whitelist of filterable fields per endpoint).

**Mini-phase D — Dependency injection cleanup**
- [ ] Move `get_db` into `app/api/dependencies.py` properly; route files use `Depends(get_db)` everywhere (College endpoint already does).
- [x] Replace mock `get_current_user`/`get_current_admin` with real ones once Phase 04 lands (marked TODO now). — real JWT deps in `app/api/deps.py`; stale `app/api/dependencies.py` still holds unused mocks

**Mini-phase E — Tests**
- [ ] Expand `tests/` to cover envelope shape, 404s, validation errors, pagination bounds, filtering.
- [ ] Add test DB isolation (create/drop schema per test run via fixture) — current tests hit dev DB.

**DoD:** Swagger (`/docs`) lists all module namespaces; every router delegates to service→repository; tests pass on isolated DB.

---

## DAY 2

### PHASE 04 — AUTHENTICATION + RBAC

**Goal:** Production auth end-to-end. No plaintext passwords, short-lived access + refresh tokens, 6 roles, RBAC on routes.
**Current state:** 🔶 Models + JWT/bcrypt deps exist; `app/core/security.py` (hash/verify/access/refresh/decode) + register/login endpoints live; real auth deps (`get_current_user`, `get_current_active_user`, `RoleChecker`) in `app/api/deps.py`; auth tests for register/login/invalid/duplicate. Missing: refresh rotation/password-reset/OTP endpoints, refresh-token store, 6-role seed, permission checker, rate limiting, Next.js auth pages (only `.astro` drafts).

**Mini-phase A — Deps + password security**
- [x] Add deps: `passlib[bcrypt]` (or argon2), `python-jose` or `pyjwt`, `httpx` (tests), `python-multipart`. — passlib/pyjwt/multipart/fastapi-limiter in; httpx missing
- [x] Implement `app/core/security.py`: hash_password, verify_password (bcrypt), create_access_token (short TTL, ~15 min), create_refresh_token (7 days, rotated), decode_token. — claims = sub+type+exp only (no jti/iss/aud)
- [ ] JWT claims: `sub` (user UUID), `role`, `type` (access/refresh), `jti` (for refresh-token lookup), `exp`, `iat`, `iss`, `aud`.

**Mini-phase B — Refresh-token store**
- [ ] Add `refresh_tokens` table (token_hash, user_id, expires_at, revoked_at, replaced_by, ip, user_agent).
- [ ] Service: issue/rotate/revoke refresh tokens; reuse-detection (if revoked token reused → revoke family).

**Mini-phase C — Endpoints**
- [x] `POST /api/v1/auth/register` — Student role default; unique email/mobile; returns tokens + profile stub. — register exists (no role assign/profile stub yet)
- [x] `POST /api/v1/auth/login` — email+password OR mobile+password placeholder for OTP. — exists at `/api/v1/auth/login/access-token`
- [ ] `POST /api/v1/auth/refresh` — rotate refresh → new access+refresh.
- [ ] `POST /api/v1/auth/logout` — revoke current refresh.
- [ ] `POST /api/v1/auth/password-reset/request` (email) → `POST .../confirm` (token + new password).
- [ ] `POST /api/v1/auth/email-verification/request` + `/confirm`.
- [ ] Schema: mobile OTP (`POST /api/v1/auth/otp/send`, `/verify`) — architecture prepared, wire if OTP provider chosen.

**Mini-phase D — Roles, permissions, RBAC deps**
- [ ] Seed the 6 roles: SUPER_ADMIN, CONTENT_ADMIN, COUNSELLOR, TEST_ADMIN, SEO_ADMIN, STUDENT.
- [ ] Permission catalog seed + role↔permission mapping table (configurable later).
- [ ] Dependencies: `require_auth`, `require_role([...])`, `require_permission("colleges.create")`; raise 401/403 with clean envelope.
- [x] Replace mocks in `app/api/dependencies.py`. — mocks removed; `dependencies.py` is now a clean `get_db` re-export; real JWT deps live in `app/api/deps.py`

**Mini-phase E — Rate limiting + audit hooks**
- [ ] Redis-backed rate limiter dependency for `/auth/*` (login/otp, e.g. 5/min per IP+mobile).
- [ ] Write `AuditLog` entries on login, failed login, password change, role changes (model exists).

**Mini-phase F — Auditable token + failure handling**
- [ ] Guarantee access-token expiry returns 401 (not 500); invalid signature/permission → 403; consistent error messages.

**Mini-phase G — Frontend auth pages**
- [ ] `/login`, `/register`, `/forgot-password`, `/reset-password` with forms, client validation, loading/error states. — only `.astro` drafts in `frontend/src/pages/` (NOT runnable in Next.js; need React ports)
- [ ] Auth context (React) storing tokens securely; axios/fetch client with automatic refresh on 401.
- [ ] Protect route groups via middleware (admin → /admin guard, student → /dashboard guard).

**Mini-phase H — Backend tests**
- [ ] registration, login, invalid credentials, protected route (401), role authorization (403), token expiration, refresh rotation, duplicate email. — partial: register/login/invalid/duplicate covered in `backend/tests/api/v1/test_auth.py`

**DoD:** Auth works end-to-end from frontend forms to protected API; all 8 test groups green; refresh rotation tested; audit logs written.

---

### PHASE 05 — DESIGN SYSTEM + UI FOUNDATION

**Goal:** Consistent, premium EdTech UI system. No page-specific random styles.
**Current state:** ✅ Complete as of `f00209b` (friend). DESIGN.md + tokens + Geist fonts; all ui primitives live (Button/Input/Card/Badge/Skeleton/Tabs/Breadcrumbs/Pagination/Typography + Select/Textarea/Checkbox/Radio/Switch/Label + Modal/Dropdown/Alert/Toast/Table/EmptyState/ErrorState); layout (navbar/footer/container/page-header); domain folders admin/ai/college/course/forms/mock-test/search/student + `lib/api.ts` (full typed client) + `lib/utils.ts`. Known: `src/app/design-system/page.tsx` playground has lint errors; src/pages/*.astro leftovers not Next-runnable. React Query not installed (not blocking).

**Mini-phase A — Design tokens & foundation**
- [x] Create `DESIGN.md` (brand colors, typography scale, spacing scale, radius, shadows, motion) — AGENTS.md depends on it.
- [x] Implement tokens in `globals.css` using Tailwind v4 `@theme` (CSS vars).
- [x] Font strategy (system or loaded variable font), fluid type on mobile-first. — Geist/Geist_Mono via next/font in layout.tsx
- [x] Color contrast-safe palette; define light scheme only (dark optional later).

**Mini-phase B — `components/ui` primitives**
- [x] Button (primary/secondary/ghost/outline/danger, sizes, icon, loading spinner, full-width on mobile).
- [x] Input, Select, Textarea, Checkbox, Radio, Switch, Label+error+helper text.
- [x] Card (default/pressable/horizontal), Badge, Skeleton loaders.
- [x] Dropdown, Modal, Tabs, Breadcrumbs.
- [x] Pagination, Table, Alert (info/success/warning/error).
- [x] Toast system, Empty state, Error state, Form (`forms/form-field.tsx`).

**Mini-phase C — `components/layout`**
- [x] Responsive navigation (navbar + footer + container + page-header).
- [x] Footer (about, quick links, contact, legal, socials).

**Mini-phase D — Domain component folders**
- [x] `components/forms` — form-field.tsx.
- [x] `components/college` — college-card.tsx.
- [x] `components/course` — course-card.tsx.
- [x] `components/search` — global-search.tsx.
- [x] `components/ai` — ai-chat.tsx.
- [x] `components/mock-test` — mock-test-ui.tsx.
- [x] `components/admin` — admin-layout.tsx.
- [x] `components/student` — student-dashboard.tsx.

**Mini-phase E — API-driven architecture**
- [x] Frontend API client (`lib/api.ts`) with typed fetch wrappers + error normalization.
- [ ] React Query (or SWR) provider for server-state (caching, retries, GC). — not installed
- [x] Loading/error/empty states available (ui/empty-state, ui/error-state, ui/toast).

**DoD:** Design tokens compiled; primitive gallery renders on a `/design` style-guide route (dev-only); API client works against backend; mobile nav opens/closes correctly.

---

## DAYS 3–4

### PHASE 06 — HOMEPAGE

**Goal:** Modern EdTech homepage, fully API-driven, per spec section list.
**Current state:** ✅ Core complete (uncommitted, verified build `next build` green + lint clean on home/* files). Backend `GET /api/v1/cms/homepage` + `HomepageContent` model + idempotent seed. Frontend `src/app/page.tsx` SSR homepage rendering all 14 spec sections with per-section loading, error, empty states + SEO metadata + JSON-LD `WebSite`/`Organization`. Merge note: page.tsx consumes friend's generic `lib/api.ts` via `api.get<{data}>("/cms/homepage")`. Remaining: live search autocomplete (Phase 08), mobile-first visual pass (Phase 43).

**Mini-phase A — Homepage content API contract**
- [x] Backend `GET /api/v1/cms/homepage` → structured sections (hero, quick actions, popular courses, featured colleges, popular searches, scholarships, upcoming exams, mock tests, why-us, reviews, articles, CTA).
- [x] Seed/demo data only, clearly marked. — `database/seeds/seed_homepage.py` (idempotent)

**Mini-phase B — Hero + Search**
- [x] Hero: "Find the Right College for Your Future".
- [x] Large search input: "Search colleges, courses, exams or locations" (search input done; live autocomplete deferred to Phase 08).
- [x] Buttons: Search, AI College Predictor (→ /predictor).

**Mini-phase C — Quick actions + sections**
- [x] Quick-action cards (6): Find Colleges, Compare Colleges, College Predictor, Scholarships, Mock Tests, Admission Assistance.
- [x] Popular courses (from CMS), Featured colleges (from CMS), Popular college searches (from CMS), Scholarships (live top 4), Upcoming exams (live + dates), Mock tests CTA strip, Why Padhaanewala, Student reviews (approved only), Latest articles (from blog API).
- [x] Admission assistance CTA (links to enquiry modal/`/contact`).

**Mini-phase D — States + SEO**
- [x] Loading skeletons per section, error fallback ("Something went wrong, please try again."), empty states per section.
- [x] Metadata: SEO title/desc + OG + canonical (layout.tsx + page.tsx); JSON-LD `WebSite` + `Organization`.

**DoD:** ⬜ Partial-only — every section renders from CMS API ✅, sections degrade gracefully ✅, mobile-first layout verified requires Phase 43 visual pass.

---

### PHASE 07 — COLLEGE DATABASE + ADMIN CRUD

**Goal:** Complete college module including verification fields, slug, gallery, and admin CRUD.
**Current state:** ✅ Core complete (uncommitted, verified backend import + `next build` green + lint clean on our files). College model extended (slug, official_name, college_type, is_private, accreditation, recognition, established_year, website/email/phone, admission_status, has_hostel, rating, lat/lng, google_maps_url/place_id, verified_by_id, is_published); `Location.district` added; migration `b7c2d3e4f5a6`; schemas full; repository filter query-builder; service slug-gen (suffix) + duplicate-name detection + publish/verify/bulk-archive; public API (filters + by-slug) + admin API (RBAC SUPER_ADMIN/CONTENT_ADMIN, GET/POST/PUT/DELETE/publish/verify/bulk-archive); admin frontend `/admin/colleges` (table+filters+pagination) + `/new` + `/[id]` form (all fields, publish toggle, verification panel). Gallery/cover_image deferred to Phase 30 (Media).

**Mini-phase A — Model + schema completion (ties to Phase 02 gap fixes)**
- [x] Ensure `College` has: college_code (e.g. COLLEGE000001), slug, official_name, college_type, govt/private, accreditation, recognition, estd_year, address fields via location, website/email/phone, admission_status, lat/lng, google_maps_url, google_place_id, is_published. — cover image/gallery deferred to Phase 30
- [x] `CollegeRead/CollegeCreate/CollegeUpdate` Pydantic schemas match all fields; slug auto-generated from name on create, editable.

**Mini-phase B — Backend service hardening**
- [x] Slug uniqueness with suffix strategy (`-2`, `-3`...); duplicate-name detection (normalize: lowercase, strip "the"/"institute", fuzzy check) before create.
- [x] Verified-data provenance: source_name, source_url, verification_status, last_verified_at surfaced in API responses. — + verified_by_id
- [x] Filters: course, state, district, city, type, govt/private, university, fee range, has_hostel, rating, accreditation, admission_status. Query params + pagination implemented in public GET /colleges.

**Mini-phase C — Admin API (RBAC-protected)**
- [x] `POST/PUT/DELETE /api/v1/admin/colleges`, GET /{id}, publish/unpublish, set verification status, archive (soft delete), bulk archive from admin.
- [ ] Bulk import hook placeholder (full import in Phase 38). — deferred

**Mini-phase D — Admin frontend**
- [x] `/admin/colleges` — list table (name, code, type, state, status, verified), search, filters, pagination.
- [x] Add/Edit form with all fields + inline validation + save states; publish toggle; verification panel (source, status).
- [x] Delete/archive with confirmation dialog; bulk actions bar. — single archive done; bulk UI tie-in Phase 38

**Mini-phase E — College gallery storage**
- [ ] Upload via Media module (Phase 30); admin can attach multiple images w/ alt text; cover selection. — deferred to Phase 30

**DoD:** Admin creates → publishes → a college appears live; slug unique; verification fields editable and visible in API; no hardcoded colleges anywhere.

---

### PHASE 08 — COLLEGE SEARCH

**Goal:** Advanced, SEO-friendly search with deep filtering.
**Current state:** ✅ Complete at `f96d8d1` (commits `75f22f0` + `f96d8d1`, pulled this session). Backend: all Phase 07 filters + sort (relevance/name/rating/fees) on `GET /colleges`, FTS via `search_vector` tsvector + trigram ILIKE (migrations `d9e4f5a6b7c8`, `e1a2b3c4d5e6`), `GET /colleges/facets`, `GET /search/suggestions`. Frontend `/colleges`: search-param-driven filter UI, debounced autocomplete, mobile filter sheet, pagination + empty/error states, SEO title/canonical. Verified with a 30-test real-DB pytest suite (per commit `f96d8d1`).

**Mini-phase A — Backend search API**
- [x] `GET /api/v1/colleges` extended with all Phase 07 filters; whitelisted params; `page`/`size`/`sort`.
- [x] Sort options: relevance, name, rating, fees asc/desc.
- [x] PostgreSQL search: `search_vector` tsvector (already on model) + trigram index on name; route query through it.
- [x] Aggregations endpoint `GET /api/v1/colleges/facets` (counts per state/course/type) to drive filter UI.
- [x] Autocomplete endpoint `GET /api/v1/search/suggestions?q=` returning colleges/courses/exams/locations.

**Mini-phase B — Unit/index perf**
- [x] Index all filter columns; paginate hard (max size 100). — EXPLAIN ANALYZE measurement not yet documented (Phase 37)

**Mini-phase C — Filter UI (`/colleges`)**
- [x] Filter panel: Course, State, District, City, Govt/Private, University, Fees range, Hostel, Rating, Accreditation, Admission status.
- [x] URL query params as source of truth (shareable, back-button friendly); filters persist; Clear Filters button.
- [x] Autocomplete suggestions in search bar; mobile: collapsible filter sheet.

**Mini-phase D — Results + states**
- [x] Result cards (name, location, type, rating, courses, fee badge, Save/Compare toggles).
- [x] Sorting control, pagination/load-more, no-results state with suggestion (broaden filters), error state.
- [x] SEO: dynamic title/desc/canonical reflecting active filters on curated paths (`/colleges/bhms-colleges-in-karnataka` — programmatic SEO Phase 31).

**DoD:** Query `course=BHMS&state=Karnataka&college_type=private` returns matching colleges on page 1 under measurement; all filters combined without error; URL shares filter state.

---

## DAYS 5–6

### PHASE 09 — COLLEGE DETAIL PAGE

**Goal:** Best-in-class SEO college page, fully DB-driven.
**Current state:** 🔶 Core complete at PROMPT 09 (this session). Page `/college/[slug]` fully rebuilt with all content from the live detail API; backend detail API (`GET /api/v1/colleges/detail/{slug}`, schema + service + repo) was built in Phase 07. Remaining within phase: sticky mobile action bar (Call/WhatsApp), WhatsApp contextual CTA, schema.org-validator print-out, view-counter analytics (Phase 32), review form (Phase 20).

**Mini-phase A — Backend detail API**
- [x] `GET /api/v1/colleges/detail/{slug}` public: full college + courses+fees, admission, eligibility, cutoff (recent years), facilities, approved reviews+rating, gallery, FAQs, verification info, university, location. — registered in Phase 07; consumed by this page
- [ ] Increment view counter (analytics); return breadcrumb trail. — analytics Phase 32

**Mini-phase B — Page layout (`/college/[slug]`)**
- [x] Header: name, location, type, rating/reviews, actions Apply/Get Admission Help, Compare (adds to compare tray), Save College (client shortlist; auth-backed save deferred to Phase 15).
- [ ] Sticky mobile action bar (Call / WhatsApp / Enquiry). — pending
- [x] Sections: Overview; Courses (built-in with fees); Fees (structured + "Approximate fee" disclaimer); Eligibility; Admission; Cutoff (table by year/category); Facilities (chips); Reviews (approved only — submit form is Phase 20); Gallery (lazy images w/ alt); FAQs (accordion + FAQ schema); Map (lat/lng embed, external directions link).
- [x] Verification badge: "Last verified: <date>" + source name, plus "View source" link.

**Mini-phase C — SEO**
- [x] Metadata: title, desc, canonical, OG, twitter; JSON-LD: `CollegeOrUniversity` (= EducationalOrganization), `BreadcrumbList`, `Course` (for each), `FAQPage`. ISR via `export const revalidate = 3600` + cache tags.
- [x] Breadcrumbs rendered (Home / Colleges / State / College).

**Mini-phase D — CTA + integrity**
- [x] Get Admission Assistance (form, prefills college, hidden `source=college-detail`), phone link (`tel:`), "Information is for guidance; verify with institution" disclaimers, missing-data sections show "Not available in verified database."
- [ ] WhatsApp contextual message ("Hello Padhaanewala, I am interested in admission at [College Name]"). — pending

**DoD:** Page passes a print of all structured-data snippets against Schema.org validator; disclaimers present; every section handles missing data.

---

### PHASE 10 — COURSE SYSTEM

**Goal:** Course DB + public pages + admin CRUD, with dynamic "colleges offering this course."
**Current state:** 🔶 Course model minimal (name, level); no slug/degree/eligibility/etc.

**Mini-phase A — Model/schema completion (Phase 02 gap-fix linkage)**
- [ ] Add name, slug, degree, duration, eligibility, entrance_exam, admission_procedure, fee_info, career_info, description, is_published; FAQ relation; SEO fields.
- [ ] Schemas + Admin API under `/api/v1/admin/courses` (CRUD, publish/archive, SEO fields).

**Mini-phase B — Admin course UI**
- [ ] `/admin/courses` list + add/edit form (rich text for eligibility/career), publish toggle, archive, SEO tab, related courses picker.

**Mini-phase C — Public course list (`/courses`)**
- [ ] Grid grouped by stream (Medical/AYUSH/Paramedical/Pharmacy/Nursing/Engineering/MBA/BCA/BA/Paramedical/Skill) from categories; filter + search; SEO title/desc; card shows degree, duration, eligibility, colleges count.

**Mini-phase D — Course page (`/courses/[slug]`)**
- [ ] Sections: Overview, Duration, Eligibility, Admission, Entrance exam, Fees, Colleges offering course (lived from reverse FK, with Save/Enquiry actions), Career opportunities, FAQs, Related courses, CTA → Get Admission Assistance.
- [ ] Breadcrumbs + metadata + JSON-LD (`Course`).

**Mini-phase E — Course ↔ college linkage**
- [ ] Wires `course.colleges` via `college_courses`; when a college-course-fee is added, both pages reflect it automatically.

**DoD:** A course created in admin appears live with accurate, auto-linked college list; page handles zero-colleges state honestly.

---

## DAY 7

### PHASE 11 — COMPARISON SYSTEM

**Goal:** Multi-college comparison with shareable URLs.
**Current state:** ✅ Done at PROMPT 11 (this session). Backend comparison API + rules-based "Ask AI" + full frontend (tray, share URLs, responsive table/cards) complete. AI comparison runs a deterministic rules-based scorer over verified DB fields now; the contract is stable so Phase 26 can swap in an LLM without frontend changes.

**Mini-phase A — Backend comparison API**
- [x] `POST /api/v1/comparison` body `{college_ids: [...], course_id?}` → normalized rows (location, type, university, course, duration, fees, hostel, facilities, admission, eligibility, cutoff, rating, reviews count).
- [x] Enforce reasonable max (4); guard against invented data (only stored fields returned; missing → null/empty, never fabricated).

**Mini-phase B — Compare tray**
- [x] Client-side "Compare" action on college pages (compare-button on detail page carries college id).
- [x] Tray shows selected count; persists in localStorage; capacity enforced (4) — `lib/shortlist.ts`.
- [x] `/compare` renders responsive comparison: matrix table on desktop, stacked college cards on mobile; add-more-colleges link; remove per college; clear all.
- [x] Shareable comparison URL: `/compare?c=slug1,slug2` — opened links auto-populate the tray; "Copy shareable link" button (`navigator.clipboard`).

**Mini-phase C — "Ask AI: Which college is better for me?"**
- [x] "Ask AI" panel on `/compare` — rules-based scorer (`POST /api/v1/ai/compare`) using only verified DB fields (course match, budget, hostel, govt/private, state, rating, accreditation, cutoff availability, admission status). Outputs tier + score + strengths/weaknesses + per-fact source chips + verified date.
- [x] Never claims guaranteed admission: fixed disclaimer in the API payload and in the UI ("automated estimate … NOT an admission guarantee"). — full LLM upgrade is Phase 26 (same schema)

**DoD:** Real user flow: search → add 2–3 colleges → compare → share/refresh URL → same data.

---

### PHASE 12 — SCHOLARSHIP SYSTEM

**Goal:** Scholarship finder + detail pages + admin.
**Current state:** ✅ Complete at PROMPT 12 (this session). Model completed (slug, is_government, income_criteria, deadline, documents, application_procedure, official_application_url, status) + migration `a1b2c3d4e5f6`; backend public + admin APIs; frontend list/detail/admin UI with SEO metadata. Remaining process-level: seed real dataset (demo data only), FAQs on detail page can be added via Phase 19 CMS.

**Mini-phase A — Model/schema completion (Phase 02 gap-fix linkage)**
- [x] Fields: name, slug, provider, govt/private, eligibility, income_criteria, amount, deadline, documents, application_procedure, official_application_url, status, last_verified_at, source (from ScrapedDataMixin).
- [x] Admin API (`/api/v1/admin/scholarships`: CRUD, status, verify) + `/admin/scholarships` UI (list + add/edit form, status dropdown, delete, verification fields).

**Mini-phase B — Public list `/scholarships`**
- [x] Filters: course, state, govt/private, deadline imminent (upcoming), search; server-ordered by deadline. — "student category" + "income" filters pending (income criteria is free text)
- [x] Cards show amount, provider, deadline, govt/private badge, status, courses.

**Mini-phase C — Detail page `/scholarships/[slug]`**
- [x] Sections: name, provider, amount, eligibility, income criteria, courses/states, application procedure, documents, source & verification date, current status.
- [x] Two clearly distinct CTAs: "Official Application" (primary, external) vs "Padhaanewala counselling" (shaded, includes admission-assistance form) — never conflated.
- [x] Metadata (title/desc/canonical/OG) + JSON-LD `ScholarshipOrFinancialAid` + `SpecialAnnouncement` for active deadlines.
- [ ] FAQs section — feeds from Phase 19 CMS (entity_type="scholarship").

**DoD:** Filtered search works; official link visually distinct from Padhaanewala CTA; deadline dates from DB not code.

---

## DAY 8

### PHASE 13 — EXAM DATABASE

**Goal:** Exam DB + pages + admin; dates fully DB-driven.
**Current state:** 🔶 Exam/ExamDate models exist; nothing else.

**Mini-phase A — Model/schema completion (Phase 02 gap-fix)**
- [ ] Exam fields: name, slug, conducting_authority, eligibility, official_website, official_notification_url, description, is_published.
- [ ] ExamDate events: type (application_start/application_deadline/admit_card/exam/result), date, status, editable via admin.
- [ ] Admin API + `/admin/exams` CRUD + per-date management.

**Mini-phase B — Public `/exams`**
- [ ] List grouped Upcoming / Ongoing / Expired by computed status; countdown chips; subscribe/reminder CTA (notification phase 33); filters by status/month.

**Mini-phase C — Detail `/exams/[slug]`**
- [ ] Sections: authority, eligibility, key dates table (DB), official website/notification links (marked external), FAQs, related courses/colleges.
- [ ] Dates never hardcoded; every date shows last-updated source line.

**DoD:** Admin edits an exam date → public page updates immediately; statuses computed correctly from dates.

---

### PHASE 14 — STUDENT DASHBOARD

**Goal:** Authenticated portal with protected routes + backend authorization.
**Current state:** 🔶 Student/StudentInterest/StudentEducationHistory/StudentSavedCollege/StudentScholarshipInterest models exist; no endpoints/pages.

**Mini-phase A — Backend student profile API**
- [ ] `GET/PUT /api/v1/students/me` (name, mobile, email, education, course interest, preferred state/city, budget, scholarship interests); guard: only own record (IDOR-safe: resolve from token, not request param).
- [ ] `GET /api/v1/students/me/saved-colleges`, `GET .../test-history`, `GET .../enquiries`, `GET .../notifications`.

**Mini-phase B — Frontend `/dashboard` (auth-guarded)**
- [ ] Layout: sidebar (Profile, My Colleges, Saved, Comparison, Test History, Scholarship Interests, Enquiries, Course Interests, Notifications) + mobile tab bar.
- [ ] Profile form (edit + save states), Education section (add/edit studies), Course interest selector, Preferences (state/city/budget).
- [ ] My Colleges: saved college cards + remove + add-to-compare, Scholarship interests list (from interest actions), Enquiries list (submitted forms + status), Test History (results summary, Phase 29), Notifications (Phase 33).
- [ ] Empty/loading/error states per section.

**Mini-phase C — RBAC on frontend**
- [ ] Route guard component; unauthenticated → redirect to `/login?next=/dashboard`.

**DoD:** Register → login → dashboard reflects profile + saved items; second student cannot read first student's data (IDOR test).

---

## DAY 9

### PHASE 15 — SAVE COLLEGE

**Goal:** Save/unsave with duplicate prevention + dashboard integration.
**Current state:** 🔶 StudentSavedCollege model exists; auth API/UI still pending. NOTE (PROMPT 09): a client-side "Save College" shortlist (`lib/shortlist.ts` + `save-college-button.tsx`) now works on the college detail page — localStorage-backed, on-device only; the server-backed, per-student version remains this phase.

**Mini-phase A — Backend API**
- [ ] `POST /api/v1/students/saved-colleges/{college_id}` (upsert, idempotent).
- [ ] `GET /api/v1/students/saved-colleges` (paginated) + `DELETE .../{college_id}`.
- [ ] Bulk selected-in-compare helper: `GET /api/v1/students/saved-colleges` returns ids for compare init.

**Mini-phase B — Frontend actions**
- [ ] Save button on college card, college detail, search results (heart/star toggle w/ optimistic UI).
- [ ] Saved status must survive navigation (server state + cache).
- [ ] Dashboard My Colleges: remove, compare selected, empty state.

**Mini-phase C — Tests**
- [ ] save, duplicate-save, unsave, unauthenticated→401, other-user isolation.

**DoD:** Toggle + refresh keeps state; duplicate saves impossible; unauthenticated save prompts login.

---

### PHASE 16 — ADMISSION ENQUIRY

**Goal:** Every-page enquiry funnel → CRM, with source/UTM tracking.
**Current state:** 🔶 Partial at PROMPT 09 (this session). Public `POST /api/v1/enquiries` endpoint implemented (`app/api/v1/endpoints/enquiries.py`, schema, `Enquiry` model extended with mobile/course/preferred_college/state/source/UTM cols) + migration `f2a3b4c5d6e7`, and the college-page admission-assistance form. Remaining: honeypot/rate-limit, duplicate-flag logic, Lead auto-create + audit + worker event, UTM-from-URL + landing-path capture, reuse across every page, tests.

**Mini-phase A — Backend API**
- [x] `POST /api/v1/enquiries` — public. Fields: name, mobile, email, course, preferred_college, state, message (+ source, utm_source/utm_medium/utm_campaign). `city`, `qualification`, `utm_content`, landing path and referrer not yet added.
- [x] Validation: mobile/email + field-length validation in the Pydantic schema and client form. — honeypot + server-side rate limit pending (Phase 35)
- [ ] Duplicate handling: same mobile+course within 24h → flag "duplicate" not auto-close; still insert with reason.
- [ ] Auto-create Lead (status NEW) on insert; audit log; success message fixed: "Thank you. Our counsellor will contact you." — endpoint returns its own success message; Lead creation is Phase 17
- [ ] Admin/CRM notification event for workers (Phase 33).

**Mini-phase B — Frontend**
- [x] Reusable enquiry form component used on college page (prefills `preferred_college`, hidden `source=college-detail`). — not yet reused on course/predictor/homepage/contact pages
- [x] Client validation; submit → success state (no internal data shown); error state. — UTM-from-URL capture + honeypot field pending

**Mini-phase C — Tests**
- [ ] valid submit → 201 + lead created; invalid mobile/email → 400; honeypot filled → silently rejected; rate-limit → 429; duplicate within window flagged. — no Python/DB runtime available this session; suite not written

**DoD:** Enquiry from any page lands in admin lead list with correct source; student never sees internal lead data.

---

## DAY 10

### PHASE 17 — CRM

**Goal:** Full lead management with statuses, assignment, notes, metrics.
**Current state:** 🔶 Counsellor/Lead/LeadStatusHistory/LeadNote/LeadFollowup models exist; nothing else.

**Mini-phase A — Backend API (RBAC: SUPER_ADMIN, COUNSELLOR)**
- [ ] `GET /api/v1/leads` — filters (status, counsellor, source, date range, course), search, pagination, sort.
- [ ] `GET /api/v1/leads/{id}` + `PATCH /api/v1/leads/{id}` (status, assigned_counsellor, follow_up_date) + notes CRUD.
- [ ] Status-transition validation (allowed transitions map NEW→CONTACTED→INTERESTED→APPLICATION_STARTED→ADMISSION_COMPLETED; NOT_INTERESTED/CLOSED terminal).
- [ ] History log (LeadStatusHistory) auto-appended on any change; assignment only to counsellors; counsellors see only assigned leads.
- [ ] Metrics endpoint `GET /api/v1/leads/stats` — total, new, contacted, interested, application started, admission completed, conversion rate.

**Mini-phase B — Counsellor dashboard (`/counsellor`)**
- [ ] Assigned leads table, student details panel, quick notes, follow-up date picker + reminders, contact status, admission status.
- [ ] RBAC guard: only COUNSELLOR/SUPER_ADMIN.

**Mini-phase C — Lead ID + attribution**
- [ ] Lead `lead_id` code (LEAD000001) sequential; store enquiry source + UTM; show source column.

**DoD:** Enquiry → NEW lead → counsellor assigned → status moves through transitions with history; metrics reflect reality; counsellors isolated by scope.

---

### PHASE 18 — ADMIN DASHBOARD

**Goal:** Central admin portal, RBAC-per-module.
**Current state:** ⬜ Nothing.

**Mini-phase A — Admin shell & routing**
- [ ] `/admin` protected layout (sidebar + topbar + mobile drawer) listing all 20 modules per spec: Dashboard, Colleges, Courses, Scholarships, Exams, Students, Reviews, Blogs, FAQs, Banners, Mock Tests, Questions, Leads, Counsellors, Media, SEO, Analytics, Settings, Audit Logs.
- [ ] Module visibility driven by role permissions (SM/CD/TA/SEO/CA see only allowed).

**Mini-phase B — Dashboard cards**
- [ ] Total Students, Colleges, Courses, Scholarships, Exams, Leads, New Leads, Converted Leads, Mock Test Attempts (from stats endpoints; Phase 32 live data).

**Mini-phase C — Reusable admin primitives**
- [ ] Data-table (sort/filter/paginate/column hide), Filter bar, Confirm dialog, Form drawer/page wrapper, Status badge, Empty state, Save-state toasts.

**Mini-phase D — Students + Reviews + Settings modules (minimal)**
- [ ] Students list (view profile, disable, view leads/enquiries) — no PII exposure beyond authorized admins.
- [ ] Reviews moderation queue (Phase 20 full).
- [ ] Settings: site identity, contact info, WhatsApp number, social links — persisted to settings table/API (fuels footer + WhatsApp CTA config).

**DoD:** Every module route renders with RBAC filter; dashboard cards show live counts; settings change reflects site-wide (WhatsApp number, footer contact).

---

## DAYS 11–12

### PHASE 19 — CMS

**Goal:** Non-technical admins edit all site content without code.
**Current state:** 🔶 Post/Category/FAQ/Banner/SEOMetadata models exist; homepage content schema missing.

**Mini-phase A — CMS content schema**
- [ ] `homepage_content` table/JSON (hero, quick actions, popular courses, featured colleges, popular searches, why-us, sections order, CTA); content status enum DRAFT/REVIEW/PUBLISHED/ARCHIVED; publish_at scheduling.
- [ ] Admin API: CRUD + publish/unpublish/schedule + audit trail.

**Mini-phase B — Admin CMS UI**
- [ ] `/admin/blogs` — list + editor (title, slug, content rich text, featured image, category, author, SEO title/desc/canonical, status, publish date).
- [ ] `/admin/faqs` — manage grouped FAQs; `/admin/banners` — image/alt/link/status/schedule; `/admin/homepage` — edit each homepage section + reorder + enable/disable.
- [ ] Preview as "View" (DRAFT renders only on preview token), never on prod until PUBLISHED.

**Mini-phase C — Public blog (`/blog`, `/blog/[slug]`)**
- [ ] Categories: Admissions, NEET, AYUSH, Nursing, Scholarships, Careers, Exams, College guides, Education news.
- [ ] List (category filter, cards), detail (content, author, date, related, share), SEO metadata + `Article` JSON-LD + author.

**Mini-phase D — Public FAQ wiring**
- [ ] Global FAQs on relevant pages from DB; FAQ accordion component reused in college/course/scholarship pages (Phase 09/10/12).

**DoD:** Admin publishes a blog + edits homepage hero and banner without code; change is live immediately; DRAFT never public.

---

### PHASE 20 — REVIEWS

**Goal:** Moderated student reviews driving college ratings.
**Current state:** 🔶 Review/ReviewModeration models exist; nothing else.

**Mini-phase A — Backend**
- [ ] `POST /api/v1/colleges/{id}/reviews` (auth: STUDENT) — college, course, year, rating 1–5, text, optional info; auto-resolve student from token (no spoofing).
- [ ] Moderation API `GET/PATCH /api/v1/admin/reviews` — status Submitted → Moderation → Approved → Published / Rejected; reject/report reason.
- [ ] Public `GET /api/v1/colleges/{id}/reviews` returns only Published; rating = avg over published.
- [ ] Duplicate/spam guard: one review per student per college-course per year; text+rating similarity check; auto-flags for admin.
- [ ] On approve → recalc college rating (store denormalized aggregate or compute + cache).

**Mini-phase B — Admin moderation UI**
- [ ] Queue view (Submitted/Flagged/Approved/Rejected), actions approve/reject/hide, reason, "asked for review" status.

**Mini-phase C — Frontend**
- [ ] Review form on college page (student must be logged in; show "Login to review"); list with rating breakdown bars; "No reviews yet — be the first".

**DoD:** New review is invisible publicly until approved; approved review updates college rating; spam/duplicate blocked.

---

## DAY 13

### PHASE 21 — NATURAL LANGUAGE SEARCH

**Goal:** Parse free text → structured filters → ranked results.
**Current state:** ⬜ Nothing.

**Mini-phase A — Query parser (modular, LLM-ready)**
- [ ] `GET/POST /api/v1/search/natural?q=...` → {interpreted_filters, results}.
- [ ] Extract: course (BHMS/BAMS/BSc Nursing…), location (state/district/city + "near Bangalore" → city), budget ("under 5 lakh"), type (private/government), hostel, rating; negation/idiot-proofing.
- [ ] Confidence score; rules-first parser; interface designed so an LLM parser can swap in later (same output schema).
- [ ] Low confidence → broad safe search + "Did you mean these filters?" or clarification prompt.

**Mini-phase B — Retrieval + ranking**
- [ ] Rules → SQL filters; boolean query fallback on search_vector; optional pgvector rerank on top-N (Phase 22).
- [ ] Return interpreted filters + matching colleges + suggestions.

**Mini-phase C — Frontend**
- [ ] Homepage + `/colleges` search bar parses naturally; show chips of interpreted filters (editable/removable); results with "Match explanation" line.
- [ ] Tests: "BHMS colleges in Karnataka", "BAMS colleges near Bangalore", "Nursing colleges under 5 lakh", "Private BHMS colleges with hostel".

**DoD:** All 4 example queries return correct filters + relevant colleges; parser is rules-based now, swappable to LLM without contract change.

---

## DAYS 14–15

### PHASE 22 — RAG DATABASE

**Goal:** Reusable pgvector RAG pipeline feeding AI phases.
**Current state:** ✅ document_embeddings table + HNSW vector index + seed script; no service code.

**Mini-phase A — Embedding service (`app/services/embedding_service.py`)**
- [ ] `embed_text()`, `embed_chunks()`, `embed_documents_for_entity()`; async, no keys in frontend.
- [ ] Chunk strategy per entity type (college: overview/location/courses/fees/facilities/admission/reviews; course: overview/eligibility/admission/career; scholarship: eligibility/amount/deadline/application; FAQ: question+answer; blog chs).
- [ ] Store: entity_type, entity_id, chunk_text, embedding, metadata (source, verified date).

**Mini-phase B — Sync lifecycle**
- [ ] Hook on college/course/scholarship/FAQ create/update/delete (background via Phase 23) to regenerate embeddings; dirty-flag until done.
- [ ] Vector similarity search API `POST /api/v1/rag/search` {query, entity_type, top_k, filters} (internal/auth scope).

**Mini-phase C — Index + validation**
- [ ] Confirm HNSW index (vector_cosine_ops) exists on embedding; test similarity query correctness incl. filters; benchmark latency.

**DoD:** Editing a college triggers re-embedding; similarity search returns correct topical chunks with metadata; no keys in frontend.

---

### PHASE 23 — CELERY + BACKGROUND JOBS

**Goal:** Async workers for heavy tasks; frontend never blocks.
**Current state:** ⬜ celery in requirements; no task modules, no broker wiring.

**Mini-phase A — Broker & app wiring**
- [ ] Celery app in `app/workers/` with Redis broker/result backend; config via env.
- [ ] Healthcheck worker; run worker locally for dev; task status store (`task_status` table: task_id, name, state, progress, result/error, idempotency_key).

**Mini-phase B — Task modules (`app/workers/`)**
- [ ] `import_tasks.py` (CSV import rows processing, Phase 38), `embedding_tasks.py` (regen embeddings), `ai_tasks.py` (AI summary/caching), `email_tasks.py`, `sms_tasks.py`, `image_tasks.py` (resize/webp), `sitemap_tasks.py`, `analytics_tasks.py` (rollups), `backup_tasks.py`.

**Mini-phase C — API integration + failure handling**
- [ ] Long jobs: return task_id; frontend polls status (or SSE/websocket) — never block request.
- [ ] Retries with backoff + max attempts; failure logging to structured logs; idempotency keys for imports/emails.

**DoD:** Enqueue an embedding regen + sample email → status transitions → completion recorded; frontend poll pattern works; failures logged without stack leaks.

---

## DAY 16

### PHASE 24 — AI EDUCATION ASSISTANT

**Goal:** "Ask Padhaanewala AI" grounded in verified DB data + sources.
**Current state:** ⬜ Nothing (RAG/DB from Phases 22–23 prerequisite).

**Mini-phase A — Backend AI service (`app/services/ai_assistant.py`)**
- [ ] Pipeline: query → classify → DB retrieval (structured) + pgvector retrieval → context assembly w/ per-chunk source+verified date → LLM call → answer + sources + disclaimer.
- [ ] System prompt rules: never invent college/fee/eligibility; cite sources; mark uncertainty ("needs verification"); no guaranteed-admission statements; avoid presenting volatile admission dates as fixed.
- [ ] Streaming response for chat UX; conversation turn context (role: student profile known optionally).
- [ ] Rate limit + abuse guard; cache repeats (Phase 37); audit + failure logging to `ai` log category.
- [ ] `POST /api/v1/ai/assistant` (auth optional; student context if logged in).

**Mini-phase B — Frontend chat UI**
- [ ] Floating chat widget (homepage/global) + dedicated `/ask` page; message bubbles, typing indicator, loading state, error state, source citations (expandable "Source: college page · verified 12 Aug 2026"), disclaimer footer.
- [ ] Suggested question chips (What is BHMS? Difference between BAMS and BHMS? Which course after 12th? …).

**Mini-phase C — Guardrails tests**
- [ ] Assistant never returns fabricated college; sources resolvable; disclaimers present in output schema.

**DoD:** Both sample questions → grounded answers with citations; fabricated-data test fails properly (assistant says "information not available").

---

## DAY 17

### PHASE 25 — AI COLLEGE PREDICTOR

**Goal:** Highly Suitable / Possible / Reach outputs from verified data.
**Current state:** ⬜ Nothing.

**Mini-phase A — Predictor engine (`app/services/predictor.py`)**
- [ ] Inputs: course, entrance exam, rank/score, category, state, preferred city, budget, govt/private prefs, hostel req, other prefs.
- [ ] Pipeline: validate → structured DB filtering (eligible colleges by course/category/city/budget/hostel) → cutoff matching (opening/closing ranks by category+round) → eligibility match → scoring (distance, budget fit, rank headroom, category) → tiering HIGHLY_SUITABLE / POSSIBLE / REACH → pgvector rerank for explanation only.
- [ ] For each result: college, reason, verified data points, source, last verified date, confidence label.
- [ ] No invented cutoffs: if no cutoff data → show "cutoff not available in verified database", no guess.
- [ ] Disclaimers rendered in API payload (`estimate`, non-guarantee).
- [ ] `POST /api/v1/predictor` (auth optional; saves usage for analytics, Phase 32).

**Mini-phase B — Frontend**
- [ ] `/college-predictor` multi-step form (course→exam→rank/category→location/budget→prefs) with validation + progress.
- [ ] Results screen: 3 tiers grouped, college cards with reason + facts + "Save/Compare/Enquire", expandable data source line, prominent disclaimer banner, "Ask AI why" (Phase 26) + retry/back buttons.
- [ ] States: validation, loading, error, empty ("no matching colleges — adjust filters").

**Mini-phase C — Tests**
- [ ] Input validation, tier boundaries (rank just below cutoff → REACH), missing-cutoff honesty, budget/hostel filtering, non-guarantee wording.

**DoD:** Real inputs → correct tiering consistent with stored cutoffs; missing data handled honestly; disclaimer always visible.

---

## DAY 18

### PHASE 26 — AI COLLEGE COMPARISON

**Goal:** AI "which is better for me" grounded in DB.
**Current state:** 🔶 Rules-based version landed with Phase 11 (`POST /api/v1/ai/compare` — deterministic scorer over verified fields, tier/score/strengths/weaknesses/sources, estimate disclaimer). This phase upgrades the scorer to an LLM over RAG (needs Phases 22 + 24) — same response contract, no frontend change.

**Mini-phase A — Backend**
- [ ] `POST /api/v1/ai/compare` body {college_ids, preferences?, student_profile?} → strengths/weaknesses/suitable-profile/summary per college + side-by-side key factors.
- [ ] Uses only stored fields; every claim tied to a data point or explicit "Information not available in the verified database."
- [ ] Sources + verified dates on each factual bullet; disclaimer re: not admission guarantee; streamed responses.

**Mini-phase B — Frontend**
- [ ] On `/compare` add "Ask AI: Which college is better for me?" panel; renders points w/ inline source chips; loading/error/empty; "clear" on criteria change.

**DoD:** AI bullet list matches stored DB fields; unknown fields explicitly labeled; no guarantee language.

---

## DAYS 19–20

### PHASE 27 — MOCK TEST QUESTION BANK

**Goal:** Admin question bank with CSV import.
**Current state:** 🔶 Test/TestSection/Question/QuestionOption/TestAttempt/TestAnswer/TestResult models exist.

**Mini-phase A — Admin question CRUD**
- [ ] Question fields: exam, subject/topic (tags), difficulty (easy/medium/hard), type (MCQ single/correct), options (4), correct option, explanation, marks, negative_marks, source, is_active; status draft/published/archived.
- [ ] Question search/filter: exam, subject, difficulty, status, assigned test; bulk archive.

**Mini-phase B — CSV import (P0 skeleton; full pipeline Phase 38)**
- [ ] Upload → parse → validate (required/marks/duplicate text) → preview errors → confirm → background import; invalid rows reported, never silently dropped.

**Mini-phase C — Tests + data integrity**
- [ ] No two correct answers per MCQ; negative marks validated; import duplicates detected by normalized stem text.

**DoD:** Admin creates/edits/imports questions; invalid CSV rows produce an error report; published questions feed Phase 28.

---

### PHASE 28 — MOCK TEST ENGINE

**Goal:** Timer-based attempt with safe persistence.
**Current state:** ⬜ Models exist only.

**Mini-phase A — Backend attempt API**
- [ ] `POST /api/v1/mock-tests/{id}/attempt` (auth STUDENT) → attempt UUID + config {duration, counts}.
- [ ] `POST /api/v1/attempts/{uuid}/answer` saves answer per question-index (upsert, server-validated).
- [ ] `GET /api/v1/attempts/{uuid}` returns answered map + remaining time + review flags (never correct answers).
- [ ] `POST /api/v1/attempts/{uuid}/submit` → finalize (reject if not started/submitted); auto-submit handled client + server (server enforces duration).
- [ ] Anti-abuse: answers only while attempt active; single active attempt per test per student.

**Mini-phase B — Frontend engine (`/mock-tests`, `/mock-tests/[id]`, `/mock-tests/[id]/attempt`)**
- [ ] `/mock-tests`: exam selection, subject selection, difficulty, number of questions.
- [ ] Configure → start → attempt screen: timer (persist across refresh), question display, option select, Next/Previous, question palette (answered/current/marked/skipped), Mark for Review, Submit confirmation modal, auto-submit on 0:00.
- [ ] Refresh-safe: state from GET attempt API; connection-loss notice; no correct answers visible pre-submit.
- [ ] Mobile responsive touch-friendly palette.

**DoD:** Timer expiry auto-submits server-side; refresh resumes attempt without losing answers; submit locked after finalize.

---

## DAY 21

### PHASE 29 — MOCK TEST RESULTS

**Goal:** Detailed result + history + charts + solutions.
**Current state:** ⬜ TestResult model exists.

**Mini-phase A — Backend results**
- [ ] `GET /api/v1/attempts/{uuid}/result` — score, percentage, correct/incorrect/unattempted, time taken, topic-wise breakdown, rank/percentile (computed over completed attempts), per-question correctness audit.
- [ ] `GET /api/v1/mock-tests/{id}/results/rank` — percentile calc.

**Mini-phase B — Frontend result page**
- [ ] Score hero card + stat grid + topic-wise bar chart (no heavy chart lib unless justified), Solutions view (question + options + your answer + correct + explanation), Practice Again (new attempt).
- [ ] Save to Test History; dashboard shows past results; empty/loading/error states; mobile-responsive.

**DoD:** Submitted attempt → accurate result incl. percentile over real attempts; solutions don't leak pre-submit.

---

## DAY 22

### PHASE 30 — MEDIA + IMAGE OPTIMIZATION

**Goal:** S3/R2 storage + pipeline; images never in PostgreSQL.
**Current state:** 🔶 Media model exists; no storage code.

**Mini-phase A — Storage integration (`app/integrations/storage.py`)**
- [ ] S3-compatible client (boto3 or s3 lib) for R2; env: STORAGE_ACCESS_KEY/SECRET/BUCKET/ENDPOINT; dev uses local disk fallback.
- [ ] Signed upload or server-upload; validated types jpg/jpeg/png/webp; max 5MB; content-type + size enforced server-side.

**Mini-phase B — Optimization worker (Phase 23 `image_tasks.py`)**
- [ ] Generate: thumbnail, card, detail, WebP variants + blur placeholder; upload back + store URLs in `media` table (url, college_id?, image_type, alt, caption, upload user, created_at).
- [ ] CDN-ready URLs; cache-control headers.

**Mini-phase C — Admin media library**
- [ ] `/admin/media`: upload (drag/drop), preview, replace, archive, search by name/type, alt/caption edit, usage (used by college/blog).
- [ ] Galleries: college gallery manager (attach media → college gallery w/ alt) reused in college page.

**Mini-phase D — Delivery**
- [ ] Frontend `<Image>` with proper sizes + lazy loading; blur placeholder; no oversized binaries.

**DoD:** Admin uploads 5MB jpg → 4 variants generated + URLs in DB; invalid type/size rejected; college gallery renders optimized.

---

### PHASE 31 — SEO

**Goal:** Complete technical + programmatic SEO.
**Current state:** 🔶 SEOMetadata model exists; minimal metadata on pages none yet.

**Mini-phase A — SEO infrastructure**
- [ ] Global `<SeoHead>` component reading: seo_title, meta_description, canonical, OG, twitter; dynamic per entity (college/course/scholarship/exam/blog/article/home).
- [ ] `sitemap.xml` (dynamic, from DB; college/course/scholarship/exam/blog + static urls) + `robots.txt` reference; updated via sitemap worker.
- [ ] Clean URLs throughout (slug-based) — no `?id=`.

**Mini-phase B — Structured data library**
- [ ] Helpers emitting valid JSON-LD: `EducationalOrganization`, `Course`, `Scholarship`, `FAQPage`, `BreadcrumbList`, `Article`, `Organization`/`WebSite`.
- [ ] Applied on college, course, scholarship, blog, FAQ sections, compare/hub pages where meaningful.

**Mini-phase C — Programmatic pages (curated, quality-first)**
- [ ] Generate meaningful hubs only (e.g. `bhms-colleges-in-karnataka`, `bams-colleges-in-karnataka`, `nursing-colleges-in-bihar`, `bpharm-colleges-in-bangalore`) where ≥N colleges exist; template blends intro (from course+state data) + live college list; all others `noindex`.
- [ ] Anti-footgun: cap quantity; content threshold check; domains link to canonical college/course pages.

**Mini-phase D — Metadata defaults + crawl**
- [ ] Title patterns (e.g. `{College} – Admissions, Fees, Cutoff, Courses | Padhaanewala`); empty-metadata fallbacks; broken-link check of indexable pages; SSG/ISR for static hubs.

**DoD:** Validated structured data on sample pages; sitemap reflects DB state; programmatic hubs pass quality gate (enough colleges, unique content).

---

## DAY 23

### PHASE 32 — ANALYTICS

**Goal:** Behavioral analytics + admin dashboards.
**Current state:** ⬜ Nothing.

**Mini-phase A — Tracking events backend**
- [ ] `POST /api/v1/analytics/events` generic event intake (type, entity, ref, utm, session, device) with rate-limit/batching; store to `analytics_events` (or aggregated counters).
- [ ] Events: page_view, search, college_view, course_view, predictor_usage, ai_usage, enquiry_submit, registration, whatsapp_click, phone_click, scholarship_click, mock_test_attempt, lead_status_change.
- [ ] UTM + referrer + landing path captured at intake; leader attribution for leads (Phase 17 link).

**Mini-phase B — Frontend tracking**
- [ ] Lightweight tracker (fetch beacon) wired to key elements; personal data minimized (event IDs not raw emails).

**Mini-phase C — Admin analytics**
- [ ] `/admin/analytics` — traffic over time, top colleges/courses/searches, predictor usage, lead conversion funnel, content performance (top articles), mock-test usage.
- [ ] Google Analytics / Search Console / GTM config notes (env-gated snippet).

**DoD:** Search a college → admin analytics shows the search phrase + college view; funnel reflects lead statuses; events attributed via UTM.

---

### PHASE 33 — NOTIFICATIONS

**Goal:** Email/SMS/WhatsApp via workers, never blocking.
**Current state:** ⬜ Notification model exists; no providers.

**Mini-phase A — Notification service (`app/integrations/notifications/`)**
- [ ] Email provider adapter (SMTP/Resend/SES-style; env-gated, sandbox in dev), templates: **welcome, OTP, password reset, enquiry confirmation, lead assigned, follow-up reminder, weekly digest**.
- [ ] SMS adapter (OTP, enquiry received, counsellor call) — provider placeholder, structured payload.
- [ ] WhatsApp adapter (college enquiry, education guidance, scholarship enquiry) — configurable number from settings (Phase 18).
- [ ] `notifications` + `notification_logs` tables (status: queued/sent/failed/retried; error safe-logged).
- [ ] Workers (Phase 23) send; HTTP requests never block; retry w/ backoff.

**Mini-phase B — Trigger wiring**
- [ ] Welcome on register (worker), OTP on `/auth/otp/send`, reset email, enquiry confirmation (auto-reply to student), lead assigned → counsellor + follow-up reminder schedule, digest cron.

**DoD:** Enquiry → student confirmation email queued+delivered (or logged in dev) + lead assigned notification to counsellor; failure recorded without leaking internals.

---

## DAY 24

### PHASE 34 — GOOGLE MAPS

**Goal:** Location data + maps on college pages.
**Current state:** ⬜ Model aliases for lat/lng/gmaps_url/gplace_id added in Phase 02.

**Mini-phase A — Geocoding service**
- [ ] Backend geocode college address → lat/lng + place_id (env-gated API key, never frontend); save on college create/update.
- [ ] Batch backfill task via worker for existing colleges; manual override in admin form.

**Mini-phase B — Frontend map**
- [ ] College page: map embed from lat/lng (Maps Embed link, no key needed for simple embed) + "Get Directions"/"View on Google Maps" external link from `google_maps_url`.
- [ ] Locale search: "near Bangalore" handled by Natural Language (Phase 21) using city fallback; optional Places autocomplete on admin address (env key).

**DoD:** College with lat/lng renders map + external link; missing coords → hidden gracefully.

---

## DAY 25

### PHASE 35 — SECURITY HARDENING

**Goal:** Systematic security pass aligned to spec §52.
**Current state:** 🔶 Basic CORS, env config, model-level constraints only.

**Mini-phase A — Core security**
- [ ] HTTPS readiness (prod), security headers via middleware: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- [ ] CORS locked to known origins (already modeled); CSRF where cookies used (currently bearer → document decision).
- [ ] Input: exhaustive Pydantic validation; parameterized SQL throughout (SQLAlchemy only — never raw); XSS-safe output (React default escaping; sanitize rich-text on render `dangerouslySetInnerHTML`).
- [ ] Rate limiting: Redis-backed per-endpoint (auth, enquiries, ai, admin) with lockout; brute-force detection email lockout.
- [ ] Uploads: magic-bytes check + size + re-encode images (Phase 30 tie).
- [ ] JWT/refresh hardening (Phase 04) + token revocation on password change.
- [ ] Admin 2FA architecture: TOTP secret field + verify endpoint (available, enforced configurable).
- [ ] Audit log coverage for auth/admin/CRM critical actions.

**Mini-phase B — Authorization audit**
- [ ] Every endpoint RBAC-checked; IDOR sweep (resolve ownership from token, never request-supplied ids for ownership).
- [ ] Public endpoints return only published/approved data; admin payloads never leak to public (envelope differs).

**Mini-phase C — Error sanitization**
- [ ] Global handler maps DB/validation/500 → generic user message; internals only in logs; no stack traces in API (FastAPI `debug=False`). (Formalized Phase 36.)

**Mini-phase D — Security tests & checklist**
- [ ] Checks: no secrets in repo (scan), no SQL-injection vectors (parameterized tests), XSS payloads escaped, unauthenticated access blocked, privilege escalation blocked, upload of .exe rejected, rate limit triggers, admin-only endpoints 403 for student, IDsOR attempt returns 404.
- [ ] Write `docs/security-checklist.md` (living doc).

**DoD:** All security tests pass; `docs/security-checklist.md` checked; secret scan clean; headers active on prod/staging.

---

## DAY 26

### PHASE 36 — ERROR HANDLING + LOGGING

**Goal:** Structured JSON logs, request IDs, friendly errors, Sentry-ready.
**Current state:** 🔶 stdout structured logger + AppError base exist.

**Mini-phase A — Logging**
- [ ] Structured JSON formatter for categories: api, auth, ai, db, admin, security, worker (already partial).
- [ ] Request-ID middleware (ties logs + error responses); correlation IDs passed to workers.

**Mini-phase B — Exception handling**
- [ ] Central handlers: validation (422→user message), not-found, forbidden, unauthenticated, conflict, DB integrity → 409 "Something went wrong" family, external-service errors (AI/storage/email) mapped to 502/504 safe message.
- [ ] All exception responses use envelope; no internal detail leakage.

**Mini-phase C — Monitoring integration**
- [ ] Sentry SDK wiring (DSN via env, only in non-dev), breadcrumbs on request + context (user id, path); source-map upload for frontend.
- [ ] Health endpoints `/health` (liveness) + `/ready` (DB/Redis reachability) without leaking internals (Phase 42 finalize).
- [ ] Worker failure logging to `worker` category + task_status error.

**Mini-phase D — Frontend error UX**
- [ ] 404 page, 500 page, API-unavailable ("We can't connect right now"), unauthorized (401), forbidden (403), empty states everywhere (Phase 05 primitives).

**DoD:** Force a DB outage → user sees friendly message, logs capture stack+request-id; `/docs` matches envelope on errors; Sentry receives test event (dev).

---

### PHASE 37 — PERFORMANCE

**Goal:** Fast pages, efficient APIs, minimal wasted calls.
**Current state:** ⬜ Nothing measured.

**Mini-phase A — Measurement**
- [ ] Baseline: Lighthouse mobile+desktop on homepage/college/college-detail in staging; backend `EXPLAIN ANALYZE` on top queries; N+1 query scan (eager-load relationships in services — College relation already; audit others).

**Mini-phase B — Frontend perf**
- [ ] SSG/ISR for static hubs + courses/blogs; SSR for personalized pages; dynamic-import heavy chunks; image optimization already (Phase 30); lazy-load below-fold sections; code-split React-Query/chat widget; minimize hydration (no heavy libs on hero).

**Mini-phase C — Backend perf**
- [ ] Indexes per query plan; pagination everywhere (already core); Redis caching: homepage CMS aggregates, facet counts, structured-data JSON, predictor aggregations, search autocomplete, AI cache (Phase 24) with TTL + invalidation on content change.
- [ ] Response trimming: select columns per view; no leaks of internal fields.

**Mini-phase D — AI cost**
- [ ] Cache identical/similar AI requests (query+context hash); batch embeddings; cap tokens; background summarization (Phase 23).

**DoD:** Staging Lighthouse ≥ 90 performance on key pages; slow endpoint list driven to < 300ms p95 (staging data); N+1 scan clean.

---

## DAY 27

### PHASE 38 — DATABASE + DATA IMPORT

**Goal:** Production bulk import (CSV/Excel) w/ preview, duplicate detection, error reports.
**Current state:** ⬜ No import system. (Question import skeleton in Phase 27.)

**Mini-phase A — Import pipeline (`app/services/import_service.py`)**
- [ ] Upload → parse (csv/xlsx) → validate columns → row validation (missing/invalid) → duplicate detection (normalize names; fuzzy match vs existing; per-entity keys) → preview (valid/errored/duplicate counts + sample) → admin confirm → background import (Phase 23) → report download (success/failed/duplicate rows + reasons).
- [ ] Entities: colleges, courses, scholarships, exams, questions.
- [ ] Never silently discard invalid rows; idempotency (no double import).

**Mini-phase B — Admin UI (`/admin/import`)**
- [ ] Choose entity + download template → upload → validation progress → preview table → confirm → async job progress → results + download error CSV.

**Mini-phase C — Post-import hooks**
- [ ] After college/course changes → trigger embedding regeneration (async); set verification_status = "imported" + last_verified_at = now; audit log entry.

**DoD:** Import 500-row college CSV → correct counts, duplicates flagged, error report downloads, embeddings regen queued, one real college visible+searchable.

---

## DAY 28

### PHASE 39 — TESTING

**Goal:** Test suites + E2E + reports.
**Current state:** 🔶 Backend has colleges tests + conftest (hits real DB).

**Mini-phase A — Backend suite**
- [ ] Unit: services (predictor scoring, query parser, slug, duplicate detection, pagination, embedding chunking) with fixtures.
- [ ] Integration: each module API (auth, colleges, courses, scholarships, exams, reviews, enquiries, leads, mock-tests, ai, rag, import) against isolated test DB (transaction rollback or drop/recreate per run).
- [ ] Security tests (Phase 35) included; coverage target (e.g. ≥70%).

**Mini-phase B — Frontend tests**
- [ ] Component tests: search bar, login form validation, college card actions, compare tray, predictor form, mock-test palette.
- [ ] API-state tests: loading/error/empty/refetch with mocked client; auth redirects.

**Mini-phase C — E2E (Playwright)**
- [ ] 20 flows (register, login, college search, college detail, save, compare, course page, scholarship search, exam page, enquiry, admin login, admin college create, lead create+assign, predictor, AI assistant, mock test, result, blog, mobile nav).
- [ ] Run against staging; produce `docs/TESTING-REPORT.md`; fix critical failures.

**DoD:** `pytest` green + coverage report; `npm test` green; Playwright suite green on staging; report committed.

---

## DAY 29 — DEPLOYMENT & OPS

### PHASE 40 — PRODUCTION DEPLOYMENT

**Goal:** Staging first, then production; no secrets exposed.
**Current state:** ⬜ docs/deployment.md exists (plan-level); no infra.

**Mini-phase A — Environments**
- [ ] Dev (localhost) ✅ exists; Staging `staging.padhaanewala.in`; Prod `padhaanewala.in`.
- [ ] Cloudflare config (DNS, SSL/TLS Full, WAF basic rules, caching for static) documented; secrets in env/secrets manager, never code.

**Mini-phase B — Deploy targets**
- [ ] Frontend: Vercel (or static host) with envs per env; preview deploys per PR.
- [ ] Backend: EC2/ECS/Render + uvicorn workers behind nginx/ALB; RDS or managed Postgres; Redis; R2/S3; Celery workers + beat.
- [ ] Env matrix doc `docs/environments.md` (dev/staging/prod values, no secrets).

**Mini-phase C — Staging smoke**
- [ ] Full CI: lint, typecheck, test, build, migrations on staging, deploy backend+frotnend, run Playwright suite. Only green → prod ready.

**Mini-phase D — Production cutover**
- [ ] DNS → Cloudflare → app; HTTPS enforced; env flip to prod DB; backups active before cutover; rollback plan documented.

**DoD:** Staging fully deployed + smoke green; production live at padhaanewala.in over HTTPS; `docs/deployment.md` updated with the real, working procedure + DNS docs + third-party service list.

---

### PHASE 41 — BACKUP + DISASTER RECOVERY

**Goal:** Verified backups that actually restore.
**Current state:** ⬜ Nothing.

**Mini-phase A — Backups**
- [ ] PostgreSQL: daily full `pg_dump`/`pg_basebackup` + WAL archiving; off-site (S3/R2) + retention (e.g. 30 days + weekly/monthly); automated via cron/worker.
- [ ] Redis: snapshot strategy (AOF/RDB) + backup; Object storage: versioning + cross-region replication where possible.
- [ ] `scripts/backup.sh` + `backup_tasks.py` (Phase 23).

**Mini-phase B — Restoration testing**
- [ ] Run a real restore into a scratch DB on staging; verify counts + a known record; schedule periodic restore test; log proof.
- [ ] `docs/backup-recovery.md`: schedule, locations, retention, restore steps, emergency procedure, staging-restore test log.

**DoD:** A restore test has actually succeeded (documented, with output) before claiming backup works.

---

### PHASE 42 — MONITORING

**Goal:** Uptime + errors + health + alerts.
**Current state:** 🔶 /health exists (basic).

**Mini-phase A — Health + ready details**
- [ ] `/health` (liveness: process up) + `/ready` (DB, Redis, storage reachability) — safe responses, no secrets.
- [ ] Frontend-facing health page? (no — app handles 503 gracefully via Phase 36).

**Mini-phase B — Observability**
- [ ] Sentry (backend+frontend), uptime monitor (UptimeRobot/Betterstack/Cloudflare), API response-time metrics (request timing log → dashboard), DB/Redis/worker health checks, AI failure & auth-failure counters, security-event alerts.
- [ ] Alerting channels: email + Slack/telegram (env-config); alert thresholds defined.

**Mini-phase C — `docs/monitoring.md`**
- [ ] Document each monitor, alert rule, on-call/runbook links.

**DoD:** `/ready` reflects real dependencies; a synthetic outage triggers an alert; monitoring doc accurate; sensitive info not exposed via health.

---

## DAY 30 — FINAL AUDITS

### PHASE 43 — FINAL UI/UX AUDIT

**Goal:** Professional, consistent experience across breakpoints.
- [ ] Walk every public + admin + dashboard page on mobile/tablet/desktop (Playwright snapshots + manual).
- [ ] Checklist: nav, spacing, typography, consistency, loading/error/empty states, forms, buttons, accessibility (headings, labels, keyboard, focus, contrast AA, touch targets ≥44px), responsive tables, search UX, CTA placement.
- [ ] Fix inconsistencies using the design system primitives — no new ad-hoc styles; no business-logic changes unless required for UX.
- [ ] Output `docs/UI-UX-AUDIT.md` with findings + fixes.

**DoD:** Audit checklist completed; all AA contrast + keyboard-nav issues resolved; mobile feels native (not scaled-down desktop).

---

### PHASE 44 — FINAL SEO AUDIT

**Goal:** Catch rank-blockers.
- [ ] Verify titles/descriptions/canonicals/OG on all page types; XML sitemap + robots correctness; structured-data validation on samples; breadcrumbs; internal linking from hubs; clean URLs everywhere; no duplicate-content traps (programmatic gates); broken-link crawl; JS-independent crawlability for indexable pages; performance (Lighthouse) on key templates.
- [ ] Output `docs/SEO-AUDIT.md` with issues → fix critical ones.

**DoD:** Audit doc + fix log; indexable pages reachable without JS; structured data valid; no broken internal links.

---

### PHASE 45 — FINAL SECURITY AUDIT

**Goal:** Fresh, adversarial review.
- [ ] Review frontend/backend/API/DB/auth/admin/CRM/uploads/AI/RAG/workers/envs/integrations for: exposed secrets, broken access control, SQLi, XSS, CSRF, CORS, weak auth, privilege escalation, IDOR, unsafe uploads, sensitive data leakage, prompt-injection & RAG leakage in AI.
- [ ] Re-run automation (dependency vuln scan, secret scan) + manual checks; fix critical/high.
- [ ] Output `docs/security-audit.md` (findings, severity, fix, recheck).

**DoD:** Critical & high findings fixed + re-tested; report committed; no secrets in repo.

---

### PHASE 46 — FINAL END-TO-END AUDIT (vs Specification)

**Goal:** Honest PASS/PARTIAL/FAIL/NOT-IMPLEMENTED matrix — no claims without verification.
- [ ] Build matrix over: homepage, search, college pages, course pages, scholarships, exams, mock tests, auth, dashboard, saved colleges, comparison, reviews, enquiries, CRM, counsellors, admin, CMS, SEO, analytics, AI assistant, AI predictor, RAG, media, notifications, security, performance, monitoring, backups, deployment.
- [ ] For every PARTIAL/FAIL: identify exact problem, affected files, required fix, and implement where safe.
- [ ] Re-run test suites to confirm fixes.

**DoD:** `docs/QUALITY-AUDIT.md` (or the checklist) shows verified states; remaining FAILs are deliberate + documented with owner.

---

### PHASE 47 — FINAL PRODUCTION READINESS (LAUNCH)

**Goal:** Versioned "Ready for Launch" sign-off.
- [ ] Verify the 25 launch criteria (spec §67 + prompt list) one-by-one with real evidence (logs, tests, refreshed pages, UI screenshots).
- [ ] Generate:
  - `docs/FINAL-LAUNCH-CHECKLIST.md`
  - `docs/TESTING-REPORT.md`
  - `docs/DEPLOYMENT-REPORT.md`
  - `docs/KNOWN-LIMITATIONS.md`
- [ ] Only PASS items confirmed with evidence; anything unverified stays NOT VERIFIED.

**DoD:** Launch date sign-off with evidence; deliverables per spec §66 (source, schema, API docs, admin creds process, deployment doc, env doc, backup procedure, git repo, testing report, hosting/domain/DNS doc, third-party docs).

---

## Dependency Map (critical path)

```
01 → 02 → 03 → 04 ─┬→ 05 → 06 → 07 → 08 → 09 → 10
                    │                        ├─ 11 → 26
                    └→ (RBAC for 14,15,17,   ├─ 12 → 31
                        18,20,25,28)          ├─ 13 → 31
                                               ├─ 16 → 17 → 18
                                               ├─ 14 → 15 → 25
                                               └─ 27 → 28 → 29
22 ← (needs 02 pgvector + 23) → 24 → 26
03 → 23 → (22,30,33,38) → 24
```

Hard gates:
- **Phase 04** must finish before any auth-gated phase (14, 15, 17, 20, 25, 28).
- **Phase 23 (Celery)** before 22, 30 (async), 33, 38.
- **Phase 22 (RAG)** before 24, 25, 26.
- **Phase 05 (design system)** before everything visual.
- **Phase 31 (SEO infra)** lands mid-late; metadata helpers usable earlier where needed.

## Workload & current-state delta (September)

| Day | Phases | Est. cert | Notes |
|-----|--------|-----------|-------|
| 1 | 01–03 | 🔶 02/03 mostly built | Gap-fix migration + module scaffolding |
| 2 | 04–05 | 🔶 04 partial, 05 ✅ done (friend) | Auth endpoints live; design system complete at f00209b |
| 3–4 | 06–08 | ✅ 06–08 done (at `f96d8d1`) | Homepage, college DB+admin, and college search all committed |
| 5–6 | 09–10 | 🔶 09 core done (PROMPT 09) | SEO college detail page + enquiry + compare tray; 10 not started |
| 7 | 11–12 | ✅ 11 done (PROMPT 11) · ✅ 12 done (PROMPT 12) | Compare + scholarships complete; scholarships faqs tie to Phase 19 |
| 8 | 13–14 | ⬜ | Exams + dashboard |
| 9 | 15–16 | 🔶 15 shortlist-UI only; 16 partial (PROMPT 09) | Save = localStorage shortlist; enquiries endpoint + college form live |
| 10 | 17–18 | ⬜ | CRM + admin shell |
| 11–12 | 19–20 | ⬜ | CMS + reviews |
| 13 | 21 | ⬜ | NL search parser |
| 14–15 | 22–23 | 🔶 22 schema done | Celery hard gate |
| 16 | 24 | ⬜ | AI assistant |
| 17 | 25 | ⬜ | Predictor |
| 18 | 26 | ⬜ | AI compare |
| 19–21 | 27–29 | ⬜ | Mock test stack |
| 22 | 30–31 | ⬜ | Media + SEO |
| 23 | 32–33 | ⬜ | Analytics + notifications |
| 24 | 34 | ⬜ | Maps |
| 25 | 35 | ⬜ | Security pass |
| 26 | 36–37 | ⬜ | Errors/perf |
| 27 | 38 | ⬜ | Import |
| 28 | 39 | ⬜ | Testing suite |
| 29 | 40–42 | ⬜ | Deploy/backup/monitor |
| 30 | 43–47 | ⬜ | Audits + launch |

## Immediate next action

Execute **Phase 01 Mini-phase A** (repo hygiene: delete dead models, fix Astro refs) → **Phase 02 gap-fix migration** → **Phase 03 module scaffolding** on Day 1.