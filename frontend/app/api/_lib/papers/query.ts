import { NextRequest } from 'next/server'
import { ValidationError } from '../errors'
import type { PapersQuery, PapersSort } from './types'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50
const DEFAULT_SORT: PapersSort = 'year_desc'

const parseIntOrNull = (value: string | null | undefined) => {
  if (value === null || value === undefined) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const clampLimit = (value: number | null) => {
  if (value === null) return DEFAULT_LIMIT
  const bounded = Math.max(1, value)
  return Math.min(bounded, MAX_LIMIT)
}

const normalizeSort = (value: string | null | undefined): PapersSort => {
  if (!value) return DEFAULT_SORT
  const lower = value.toLowerCase()
  if (lower === 'year_asc' || lower === 'year_desc' || lower === 'name_asc' || lower === 'name_desc') {
    return lower as PapersSort
  }
  return DEFAULT_SORT
}

const parseTags = (input: string | string[] | null): string[] | undefined => {
  if (!input) return undefined
  const arr = Array.isArray(input)
    ? input.flatMap((item) => item.split(','))
    : input.split(',')
  const cleaned = arr
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  const deduped = Array.from(new Set(cleaned))
  return deduped.length ? deduped : undefined
}

export function parsePapersQuery(req: NextRequest): PapersQuery {
  const params = req.nextUrl.searchParams

  const page = Math.max(parseIntOrNull(params.get('page')) ?? DEFAULT_PAGE, 1)
  const limit = clampLimit(parseIntOrNull(params.get('limit') ?? params.get('pageSize')))
  const sort = normalizeSort(params.get('sort'))

  const yearRaw = params.get('year')
  let year: number | string | null = null
  if (yearRaw !== null) {
    const parsedYear = Number.parseInt(yearRaw, 10)
    year = Number.isNaN(parsedYear) ? yearRaw : parsedYear
  }

  const yearFrom = parseIntOrNull(params.get('yearFrom'))
  const yearTo = parseIntOrNull(params.get('yearTo'))

  const search = params.get('search') ?? params.get('q')
  const tags = parseTags(params.getAll('tags').length ? params.getAll('tags') : params.get('tag') ?? params.get('tagSlug'))

  return {
    page,
    limit,
    sort,
    year,
    yearFrom,
    yearTo,
    search: search && search.trim().length > 0 ? search : null,
    tags,
  }
}

export function validateYearRange(yearFrom: number | null, yearTo: number | null): void {
  if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) {
    throw new ValidationError('Invalid year range: yearFrom must be less than or equal to yearTo')
  }
}
