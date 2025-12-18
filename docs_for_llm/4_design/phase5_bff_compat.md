# Phase 5 – BFF Compatibility Layer Design  
2025-12-19 09:30:00 CST

> Scope: Keep legacy API contracts stable while swapping data source to Payload via Next.js Route Handlers. No frontend changes; response shapes, query params, sorting, and error envelopes must remain identical. Deterministic ordering and feature-flag rollbacks are mandatory. Caching is intentionally deferred until full parity is verified; Phase 5 focuses on correctness over performance.

## 1) Legacy Contract Revalidation (verified from repo)

| Endpoint (method) | Call sites | Query params (aliases) | Response shape | Sorting (default + tie-break) | Errors |
| --- | --- | --- | --- | --- | --- |
| `GET /api/timeline` | `frontend/app/(site)/history/TimelineFeed.tsx` (SWR); tests | `page`; `limit` \| `pageSize`; `order` \| `sort` (`desc` default); `year`; `yearFrom`; `yearTo`; `q` \| `search` | `{ data: [{ id, slug, yearLabel, yearValue, title, description, sortOrder, createdAt, updatedAt }], meta: { page, limit, pageSize, total, totalPages, order, hasNext, hasMore } }` | `sortOrder desc`, tie-break `id desc` (legacy Prisma orderBy [sortOrder, id]) | 400 when `yearFrom > yearTo`: `{ message, error: { code: 400, message: 'Bad Request' } }`; otherwise 200/500 via error middleware |
| `GET /api/links` | `frontend/app/(site)/links/page.tsx` (SSR); `frontend/app/(site)/links/LinksDirectory.tsx` (client refetch) | `view` (`nested` default, `flat`); `section` \| `sectionSlug`; `group` \| `groupSlug`; `q` \| `search` | `nested`: `{ data: [section{ slug, title, sortOrder, groups: [group{ slug, title, sortOrder, links: [link{ slug, name, url, description, sortOrder }] }]}], meta: { sectionCount, groupCount, linkCount, filters: { section, group, keyword, view } } }`; `flat`: `data` is list of links with embedded `section`/`group` objects, `meta.linkCount` recalculated | All levels `sortOrder desc`, tie-break `id desc`; sections -> groups -> links | No special errors; unknown filters → empty arrays; non-200 only on server failure |
| `GET /api/papers` | `frontend/app/(site)/papers/page.tsx` (SSR); `.../PapersCatalog.tsx` (client) | `page`; `limit` \| `pageSize`; `year`; `yearFrom`; `yearTo`; `tags` \| `tag` \| `tagSlug` (CSV/array); `search` \| `q`; `sort` (`year_desc` default; also `year_asc`, `name_asc`, `name_desc`) | `{ data: [{ slug, title, authors, year, venue, url, abstract, sortOrder, tags:[{ slug, name }], createdAt, updatedAt }], meta: { page, limit, pageSize, total, totalPages, hasNext, hasMore } }` | Default `year desc`, tie-break `sortOrder desc`, then `id desc`; other sorts follow legacy map with `id desc` tie-break | 400 when `yearFrom > yearTo` with same envelope as timeline; otherwise standard errors |
| `GET /articles` | `frontend/lib/articles.ts` (SSR list); used by `frontend/app/articles/page.tsx` | `page`; `pageSize`; `q`; `category`; `tags` (CSV); `year`; `yearFrom`; `yearTo`; `sort` (`published_desc` default; `published_asc`, `title_asc`, `title_desc`); `status` (`draft`/`review`/`published`/`all`, default `published`) | `{ data: [article fields], meta: { total, page, pageSize, totalPages, hasNext } }` where article fields include `{ id, slug, title, excerpt, coverImageUrl, content, status, publishedAt, updatedAt, readingTime, timelineYear, author{ id, email }, category{ id, slug, name }?, tags[{ id, slug, name }] }` | Sort map above; tie-break `id` within Prisma order arrays | 404 on not found handled only in detail route; list returns empty set on filters |
| `GET /articles/:slugOrId` | `frontend/lib/articles.ts` (SSR detail), `frontend/app/articles/[slug]/page.tsx` | Path param `slugOrId` (slug preferred, numeric id fallback) | Full article as above plus `timelineEvents[{ id, slug, yearLabel, yearValue, title }]` | Not sorted (single record) | 404 `{ message: '文章不存在' }`; other errors propagated |

> No POST/PUT/DELETE endpoints are invoked by current frontend.

## 2) Phase 5 Sub-Phases (5.1–5.4; auth optional)

### 5.1 Timeline
- **Endpoint**: `GET /api/timeline` (App Router handler).
- **Query parsing/validation**: enforce ints for `page` (>=1), `limit|pageSize` (1–50, default 8), `order|sort` to `asc|desc` (default desc); `year`, `yearFrom`, `yearTo`; `q|search`. Reject `yearFrom > yearTo` with legacy 400 envelope.
- **Payload access**: `timeline-events` via local API; filters on `title/description contains` for `q`; `date` year equals for numeric `year`; `yearLabel contains` for non-numeric; `date` gte/lte for ranges. Ensure determinism with `sortOrder` then `id/createdAt`.
- **Reshape**: map to legacy fields; derive `yearValue` from `date`; `slug` = `String(id)` (stable, deterministic, internal identifier, not SEO-facing). No new Payload slug field is added.
- **Meta**: emit `{ page, limit, pageSize, total, totalPages, order, hasNext, hasMore }` with `hasNext/hasMore = page*limit < total`.
- **Edge cases**: empty results with `totalPages=0`; invalid range 400; non-numeric `year` -> `yearLabel contains`.
- **Rollback flag**: `BFF_TIMELINE_USE_PAYLOAD` (default on/off per rollout); fallback to legacy Prisma route when disabled.

### 5.2 Links
- **Endpoint**: `GET /api/links` (supports `view=nested|flat`).
- **Query parsing/validation**: normalize `view`; accept `section|sectionSlug`, `group|groupSlug`, `q|search`. Ignore empty strings; no pagination.
- **Payload access**: batch-fetch `link-sections` with nested `link-groups` and `links`, filtered by section/group slug and keyword on `links.name/description/url`. Order each level `sortOrder desc, id desc`. Minimize queries (ideally 1–2 via nested local API).
- **Reshape**: build nested sections→groups→links; drop groups/sections with no links under current filters (match legacy). For `flat`, flatten and embed `section`/`group` objects.
- **Meta**: `{ sectionCount, groupCount, linkCount, filters }` (recompute linkCount for flat view).
- **Edge cases**: unknown slugs -> empty; keyword may zero out groups; ensure stable order ties via id.
- **Rollback flag**: `BFF_LINKS_USE_PAYLOAD`.

### 5.3 Papers
- **Endpoint**: `GET /api/papers`.
- **Query parsing/validation**: `page`>=1; `limit|pageSize` clamp 1–50 (default 10); `search|q`; `tags|tag|tagSlug` CSV/array deduped; `year`, `yearFrom`, `yearTo` with 400 on invalid range; `sort` in {`year_desc` (default), `year_asc`, `name_asc`, `name_desc`}.
- **Payload access**: `papers` with relationships to `tags` (`type=paper_tag`). Filters: tag slug/name OR; search across `title`, authors array names, `abstract`, `venue`; numeric year matches; string year fallback matches `title|venue`. Sort per map plus `id desc` tie-break.
- **Reshape**: authors array → joined string; tags → `{ slug, name }`; include `sortOrder` (0 or derived), `createdAt`, `updatedAt`. Preserve legacy meta.
- **Meta**: `{ page, limit, pageSize, total, totalPages, hasNext, hasMore }`.
- **Edge cases**: invalid range 400; missing authors -> empty string; unknown tags -> empty result.
- **Rollback flag**: `BFF_PAPERS_USE_PAYLOAD`.

### 5.4 Articles
- **Endpoints**: `GET /articles`, `GET /articles/:slugOrId`.
- **Query parsing/validation (list)**: `page`>=1; `pageSize` clamp 1–50; `q`; `category`; `tags` CSV; `year`, `yearFrom`, `yearTo`; `sort` in {`published_desc` (default), `published_asc`, `title_asc`, `title_desc`}; `status` (`published` default, `draft|review|all` allowed). Year filters apply to `timelineYear` OR `publishedAt` window; accept unordered bounds like legacy.
- **Payload access**: `articles` with `_status` drafts; relationships to `tags` (type filters) for category/tags, `users` for author, media for cover. Use local API; avoid richText→markdown conversion at runtime—prefer stored `content_html` or precomputed plain text (hook-based).
- **Reshape (list)**: map fields to legacy (add `coverImageUrl` from media URL; `content` from stored plain/HTML-to-text if precomputed; `status` from `_status`); include `readingTime`, `timelineYear`, relations. Apply sort per map + `id` tie-break. Meta `{ total, page, pageSize, totalPages, hasNext }`.
- **Reshape (detail)**: same plus `timelineEvents` fetched by querying `timeline-events` where `relatedArticle` matches; include fields `{ id, slug?, yearLabel, yearValue, title }`. Where numeric legacy IDs are required (e.g., article detail), persist and index a `legacyId` field in Payload and return it; do not rely on runtime or in-memory mappings.
- **Edge cases**: 404 `{ message: '文章不存在' }`; tags/category missing -> empty result; status=all bypasses status filter; ensure deterministic order.
- **Rollback flag**: `BFF_ARTICLES_USE_PAYLOAD`.

### (Optional) Auth
- Only if frontend later uses it; keep legacy `/auth/login|register` passthrough with same messages; feature-flagged.

## 3) Risk Register & Mitigations
- **Slug stability**: Timeline slug is `String(id)` and treated as an internal stable identifier (not SEO); no new schema fields are added for slug.  
- **Legacy ID coverage**: Persist and index `legacyId` fields in Payload where numeric legacy IDs are required (e.g., articles); never rely on runtime or in-memory mapping.  
- **Type coercion**: Coerce query strings to numbers for pagination/years; ensure empty/invalid inputs ignored as legacy.  
- **N+1**: Use nested local API queries (one per endpoint where possible); avoid per-row lookups (e.g., pre-populate tags/authors/relations).  
- **RichText conversion cost**: Avoid runtime conversion; store plain/HTML at write-time via Payload hooks; use stored field in BFF.  
- **Pagination determinism**: Always append secondary sort (`id` or `createdAt`) matching legacy tie-breaks.  
- **Caching**: Caching is intentionally deferred until full parity is verified; Phase 5 focuses on correctness over performance.  
- **Error envelope drift**: Mirror legacy 400/404 messages and structures; centralize helpers to format errors.  
- **Feature flags/rollback**: One flag per sub-phase; environment-controlled, default conservative; fallback to legacy Prisma service. Compatibility BFF endpoints are frozen after migration; no new features should be added to legacy routes.  
- **Missing fields**: Payload schemas lacking `sortOrder`/`yearValue`/`slug` must be addressed via preexisting fields or safe defaults; document gaps before rollout.

## 4) Rollout & Patch Structure (no implementation yet)
- **Files to add**:  
  - `frontend/app/api/timeline/route.ts` (adapter)  
  - `frontend/app/api/links/route.ts` (adapter)  
  - `frontend/app/api/papers/route.ts` (adapter)  
  - `frontend/app/api/articles/route.ts`, `frontend/app/api/articles/[slugOrId]/route.ts` (adapters)  
  - Shared helpers: `frontend/app/api/_lib/query.ts` (parsing/validation), `frontend/app/api/_lib/payload.ts` (local API calls), `frontend/app/api/_lib/responses.ts` (meta shaping/error envelopes), `frontend/app/api/_lib/sorting.ts` (deterministic order maps)
  - Feature-flag util: `frontend/app/api/_lib/flags.ts`.
- **Testing plan**:  
  - Unit tests for query parsing/validation and meta shaping (Jest/Vitest).  
  - Integration tests hitting adapters with mocked payload local API to assert response shape, sorting, error envelopes.  
  - Parity tests comparing adapter output vs recorded legacy fixtures for key queries (timeline year-range 400, links flat/nested keyword filters, papers sort variants, articles status/all and detail 404).  
  - Manual smoke via `curl` against adapters with flags on/off to confirm rollback works.

## 5) Sub-Phase Checklists
- **5.1 Timeline**: Implement handler + parsing helper + meta shaper; add flag; write parity tests (page/limit, order, invalid range).  
- **5.2 Links**: Implement nested fetch + reshape; flat view adapter; counts; flag; tests for keyword/group/section filters and empty results.  
- **5.3 Papers**: Implement sort map, tag filter, authors join; meta; flag; tests for sort variants, tag filter, invalid range.  
- **5.4 Articles**: Implement list/detail; status handling; relations; reverse timeline fetch; slug/id resolution; flag; tests for status, year filters, detail 404, meta.  
- **Auth (optional)**: Only if activated; passthrough tests for messages.

## 6) Rollback Strategy
- Env flags per endpoint to switch between Payload BFF and legacy Prisma handlers instantly.  
- Keep legacy server available during rollout; deploy adapters disabled by default, enable per-endpoint.  
- If adapter errors, catch and route to legacy source; log for follow-up.  
- Compatibility BFF endpoints are frozen after migration; no new features should be added to legacy routes.  
- No frontend changes required; paths unchanged.
