import type { TimelineQuery } from './query'
import type { TimelineRecord } from './payload'

export type TimelineResponse = {
  data: Array<{
    id: number
    slug: string
    yearLabel: string
    yearValue: number | null
    title: string
    description: string | null
    sortOrder: number
    createdAt?: string
    updatedAt?: string
  }>
  meta: {
    page: number
    limit: number
    pageSize: number
    total: number
    totalPages: number
    order: 'asc' | 'desc'
    hasNext: boolean
    hasMore: boolean
  }
}

const deriveYearValue = (dateInput?: string | null) => {
  if (!dateInput) return null
  const parsed = new Date(dateInput)
  const year = parsed.getFullYear()
  return Number.isNaN(year) ? null : year
}

export function buildTimelineResponse(input: {
  query: TimelineQuery
  total: number
  items: TimelineRecord[]
}): TimelineResponse {
  const { query, total, items } = input
  const mapped = items.map((item) => {
    const rawId = item.legacyId ?? item.id
    const numericId = typeof rawId === 'string' ? Number.parseInt(rawId, 10) : rawId
    if (numericId === undefined || numericId === null || Number.isNaN(numericId)) {
      throw new Error('Invalid timeline id (non-numeric)')
    }

    const yearValue = deriveYearValue(item.date)

    return {
      id: numericId,
      slug: String(numericId),
      yearLabel: item.yearLabel,
      yearValue,
      title: item.title,
      description: item.description ?? null,
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  })

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)
  const hasMore = query.page * query.limit < total

  return {
    data: mapped,
    meta: {
      page: query.page,
      limit: query.limit,
      pageSize: query.limit,
      total,
      totalPages,
      order: query.order,
      hasNext: hasMore,
      hasMore,
    },
  }
}
