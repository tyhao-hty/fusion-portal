import { NextRequest } from 'next/server'
import { ValidationError } from './errors'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 8
const MAX_LIMIT = 50

export type TimelineQuery = {
  page: number
  limit: number
  order: 'asc' | 'desc'
  year?: number | string
  yearFrom?: number | null
  yearTo?: number | null
  q?: string | null
}

const parseInteger = (value: string | null | undefined, fallback: number | null) => {
  if (value === null || value === undefined) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const clampLimit = (value: number) => {
  const lowerBounded = Math.max(1, value)
  return Math.min(lowerBounded, MAX_LIMIT)
}

export function parseTimelineQuery(req: NextRequest): TimelineQuery {
  const params = req.nextUrl.searchParams
  const page = Math.max(parseInteger(params.get('page'), DEFAULT_PAGE) ?? DEFAULT_PAGE, 1)
  const rawLimit = parseInteger(params.get('limit') ?? params.get('pageSize'), DEFAULT_LIMIT) ?? DEFAULT_LIMIT
  const limit = clampLimit(rawLimit)

  const rawOrder = (params.get('order') ?? params.get('sort') ?? 'desc').toLowerCase()
  const order: 'asc' | 'desc' = rawOrder === 'asc' ? 'asc' : 'desc'

  const yearParam = params.get('year')
  let year: number | string | undefined
  if (yearParam !== null) {
    const parsedYear = Number.parseInt(yearParam, 10)
    year = Number.isNaN(parsedYear) ? yearParam : parsedYear
  }

  const yearFrom = parseInteger(params.get('yearFrom'), null)
  const yearTo = parseInteger(params.get('yearTo'), null)

  const q = params.get('q') ?? params.get('search') ?? null

  return {
    page,
    limit,
    order,
    year,
    yearFrom,
    yearTo,
    q,
  }
}

export function validateTimelineRange(yearFrom: number | null, yearTo: number | null) {
  if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) {
    throw new ValidationError('Invalid year range: yearFrom must be less than or equal to yearTo')
  }
}
