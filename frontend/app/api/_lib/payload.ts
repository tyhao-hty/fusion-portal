import type { Payload, Where } from 'payload'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import type { TimelineQuery } from './query'
import type { timelineSort } from './sorting'

let cachedPayload: Payload | null = null

export type TimelineRecord = {
  id: number | string
  legacyId?: number
  yearLabel: string
  date?: string | null
  title: string
  description?: string | null
  sortOrder?: number | null
  createdAt?: string
  updatedAt?: string
}

const getClient = async () => {
  if (cachedPayload) return cachedPayload
  cachedPayload = await getPayload({ config: payloadConfig })
  return cachedPayload
}

const buildWhere = (query: TimelineQuery): Where => {
  const and: Where[] = []

  if (query.q) {
    and.push({
      or: [
        { title: { like: `%${query.q}%` } },
        { description: { like: `%${query.q}%` } },
      ],
    })
  }

  if (typeof query.year === 'number') {
    const start = new Date(query.year, 0, 1).toISOString()
    const end = new Date(query.year + 1, 0, 1).toISOString()
    and.push({
      and: [{ date: { greater_than_equal: start } }, { date: { less_than: end } }],
    })
  } else if (typeof query.year === 'string') {
    and.push({
      yearLabel: { like: `%${query.year}%` },
    })
  }

  if (typeof query.yearFrom === 'number') {
    const start = new Date(query.yearFrom, 0, 1).toISOString()
    and.push({
      date: { greater_than_equal: start },
    })
  }

  if (typeof query.yearTo === 'number') {
    const end = new Date(query.yearTo + 1, 0, 1).toISOString()
    and.push({
      date: { less_than: end },
    })
  }

  if (and.length === 0) {
    return {}
  }

  return { and }
}

export async function fetchTimelineFromPayload(
  query: TimelineQuery,
  sort: ReturnType<typeof timelineSort>,
): Promise<{ total: number; items: TimelineRecord[] }> {
  const payload = await getClient()

  const result = await payload.find({
    collection: 'timeline-events',
    where: buildWhere(query),
    sort,
    limit: query.limit,
    page: query.page,
    pagination: true,
  })

  return {
    total: result.totalDocs ?? 0,
    items: result.docs as TimelineRecord[],
  }
}
