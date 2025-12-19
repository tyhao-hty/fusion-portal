import { NextRequest } from 'next/server'
import { ValidationError } from '../errors'
import type { ArticlesQuery, ArticlesSort, ArticlesStatus } from './types'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50
const DEFAULT_SORT: ArticlesSort = 'published_desc'
const DEFAULT_STATUS: ArticlesStatus = 'published'

const parseIntOrNull = (value: string | null | undefined) => {
  if (value === null || value === undefined) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const clampPageSize = (value: number | null) => {
  if (value === null) return DEFAULT_PAGE_SIZE
  const bounded = Math.max(1, value)
  return Math.min(bounded, MAX_PAGE_SIZE)
}

export function parseStatus(value: string | null | undefined): ArticlesStatus {
  if (!value) return DEFAULT_STATUS
  const lower = value.toLowerCase()
  if (lower === 'published' || lower === 'draft' || lower === 'review' || lower === 'all') {
    return lower as ArticlesStatus
  }
  return DEFAULT_STATUS
}

const normalizeSort = (value: string | null | undefined): ArticlesSort => {
  if (!value) return DEFAULT_SORT
  const lower = value.toLowerCase()
  if (lower === 'published_desc' || lower === 'published_asc' || lower === 'title_asc' || lower === 'title_desc') {
    return lower as ArticlesSort
  }
  return DEFAULT_SORT
}

const parseTags = (input: string | string[] | null): string[] | undefined => {
  if (!input) return undefined
  const arr = Array.isArray(input) ? input : input.split(',')
  const cleaned = arr.map((item) => item.trim()).filter((item) => item.length > 0)
  const deduped = Array.from(new Set(cleaned))
  return deduped.length ? deduped : undefined
}

export function parseArticlesQuery(req: NextRequest): ArticlesQuery {
  const params = req.nextUrl.searchParams

  const page = Math.max(parseIntOrNull(params.get('page')) ?? DEFAULT_PAGE, 1)
  const pageSize = clampPageSize(parseIntOrNull(params.get('pageSize')))
  const sort = normalizeSort(params.get('sort'))
  const status = parseStatus(params.get('status'))

  const searchRaw = params.get('q') ?? params.get('search')
  const search = searchRaw && searchRaw.trim().length > 0 ? searchRaw : null

  const categoryRaw = params.get('category')
  const category = categoryRaw && categoryRaw.trim().length > 0 ? categoryRaw : null

  const tags = parseTags(params.get('tags'))

  const yearRaw = params.get('year')
  let year: number | string | null = null
  if (yearRaw !== null) {
    const parsedYear = Number.parseInt(yearRaw, 10)
    year = Number.isNaN(parsedYear) ? yearRaw : parsedYear
  }

  const yearFrom = parseIntOrNull(params.get('yearFrom'))
  const yearTo = parseIntOrNull(params.get('yearTo'))

  return {
    page,
    pageSize,
    sort,
    status,
    search,
    category,
    tags,
    year,
    yearFrom,
    yearTo,
  }
}

export function validateYearRange(yearFrom: number | null, yearTo: number | null): void {
  if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) {
    throw new ValidationError('Invalid year range: yearFrom must be less than or equal to yearTo')
  }
}
